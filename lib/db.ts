import type { Database } from 'sql.js'
import type { Preferences, PracticeSession, SessionChord, SessionDetails, PracticeStats, ChordType } from './types'

let db: Database | null = null
const DB_NAME = 'jazzgym-db'

/**
 * Initialize SQLite database with schema
 * Loads from IndexedDB if exists, otherwise creates new database
 */
export async function initializeDatabase(): Promise<void> {
  if (db) return // Already initialized

  // Dynamically import sql.js to avoid Node.js module resolution issues in Next.js
  const initSqlJs = (await import('sql.js')).default
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  })

  // Try to load existing database from IndexedDB
  const savedDb = await loadDatabaseFromStorage()

  if (savedDb) {
    db = new SQL.Database(savedDb)
  } else {
    // Create new database
    db = new SQL.Database()

    // Load and execute schema
    const schemaResponse = await fetch('/db/schema.sql')
    const schema = await schemaResponse.text()
    db.exec(schema)

    // Save initial database
    await saveDatabaseToStorage()
  }
}

/**
 * Save database to IndexedDB
 */
async function saveDatabaseToStorage(): Promise<void> {
  if (!db) return

  const data = db.export()
  const request = indexedDB.open(DB_NAME, 1)

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const idb = request.result
      const transaction = idb.transaction(['database'], 'readwrite')
      const store = transaction.objectStore('database')
      store.put(data, 'data')
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
    request.onupgradeneeded = () => {
      const idb = request.result
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database')
      }
    }
  })
}

/**
 * Load database from IndexedDB
 */
async function loadDatabaseFromStorage(): Promise<Uint8Array | null> {
  const request = indexedDB.open(DB_NAME, 1)

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const idb = request.result
      if (!idb.objectStoreNames.contains('database')) {
        resolve(null)
        return
      }
      const transaction = idb.transaction(['database'], 'readonly')
      const store = transaction.objectStore('database')
      const getRequest = store.get('data')
      getRequest.onsuccess = () => resolve(getRequest.result || null)
      getRequest.onerror = () => resolve(null)
    }
    request.onupgradeneeded = () => {
      const idb = request.result
      if (!idb.objectStoreNames.contains('database')) {
        idb.createObjectStore('database')
      }
    }
  })
}

// Preferences operations
export async function getPreferences(): Promise<Preferences> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  const result = db.exec('SELECT id, time_limit, enabled_chord_types FROM preferences WHERE id = 1')

  if (result.length === 0 || result[0].values.length === 0) {
    throw new Error('Preferences not found')
  }

  const row = result[0].values[0]
  return {
    id: 1,
    timeLimit: row[1] as number,
    enabledChordTypes: JSON.parse(row[2] as string) as ChordType[],
  }
}

export async function updatePreferences(prefs: Partial<Preferences>): Promise<void> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  // Validation
  if (prefs.timeLimit !== undefined && (prefs.timeLimit < 3 || prefs.timeLimit > 60)) {
    throw new Error('Time limit must be between 3 and 60 seconds')
  }

  if (prefs.enabledChordTypes !== undefined && prefs.enabledChordTypes.length === 0) {
    throw new Error('At least one chord type must be selected')
  }

  const updates: string[] = []
  const params: any[] = []

  if (prefs.timeLimit !== undefined) {
    updates.push('time_limit = ?')
    params.push(prefs.timeLimit)
  }

  if (prefs.enabledChordTypes !== undefined) {
    updates.push('enabled_chord_types = ?')
    params.push(JSON.stringify(prefs.enabledChordTypes))
  }

  if (updates.length > 0) {
    db.run(`UPDATE preferences SET ${updates.join(', ')} WHERE id = 1`, params)
    await saveDatabaseToStorage()
  }
}

// Practice session operations
export async function createPracticeSession(timeLimit: number): Promise<number> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  db.run('INSERT INTO practice_sessions (time_limit) VALUES (?)', [timeLimit])
  const result = db.exec('SELECT last_insert_rowid() as id')
  await saveDatabaseToStorage()

  return result[0].values[0][0] as number
}

export async function addChordToSession(sessionId: number, chordName: string): Promise<void> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  db.run('INSERT INTO session_chords (session_id, chord_name) VALUES (?, ?)', [sessionId, chordName])
  db.run('UPDATE practice_sessions SET chord_count = chord_count + 1 WHERE id = ?', [sessionId])
  await saveDatabaseToStorage()
}

export async function endPracticeSession(sessionId: number): Promise<void> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  db.run("UPDATE practice_sessions SET ended_at = datetime('now') WHERE id = ?", [sessionId])
  await saveDatabaseToStorage()
}

export async function getPracticeHistory(limit: number = 50): Promise<PracticeSession[]> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  const result = db.exec(`
    SELECT id, started_at, ended_at, chord_count, time_limit
    FROM practice_sessions
    WHERE ended_at IS NOT NULL
    ORDER BY started_at DESC
    LIMIT ?
  `, [limit])

  if (result.length === 0) return []

  return result[0].values.map(row => ({
    id: row[0] as number,
    startedAt: row[1] as string,
    endedAt: row[2] as string | null,
    chordCount: row[3] as number,
    timeLimit: row[4] as number,
  }))
}

export async function getSessionDetails(sessionId: number): Promise<SessionDetails | null> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  const sessionResult = db.exec(`
    SELECT id, started_at, ended_at, chord_count, time_limit
    FROM practice_sessions
    WHERE id = ?
  `, [sessionId])

  if (sessionResult.length === 0 || sessionResult[0].values.length === 0) {
    return null
  }

  const sessionRow = sessionResult[0].values[0]
  const session: PracticeSession = {
    id: sessionRow[0] as number,
    startedAt: sessionRow[1] as string,
    endedAt: sessionRow[2] as string | null,
    chordCount: sessionRow[3] as number,
    timeLimit: sessionRow[4] as number,
  }

  const chordsResult = db.exec(`
    SELECT id, session_id, chord_name, displayed_at
    FROM session_chords
    WHERE session_id = ?
    ORDER BY displayed_at ASC
  `, [sessionId])

  const chords: SessionChord[] = chordsResult.length > 0
    ? chordsResult[0].values.map(row => ({
        id: row[0] as number,
        sessionId: row[1] as number,
        chordName: row[2] as string,
        displayedAt: row[3] as string,
      }))
    : []

  return { ...session, chords }
}

export async function getPracticeStats(): Promise<PracticeStats> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  const result = db.exec(`
    SELECT
      COUNT(*) AS total_sessions,
      SUM(chord_count) AS total_chords,
      SUM(
        CAST((julianday(ended_at) - julianday(started_at)) * 24 * 60 AS INTEGER)
      ) AS total_minutes
    FROM practice_sessions
    WHERE ended_at IS NOT NULL
  `)

  if (result.length === 0 || result[0].values.length === 0) {
    return { totalSessions: 0, totalChords: 0, totalMinutes: 0 }
  }

  const row = result[0].values[0]
  return {
    totalSessions: (row[0] as number) || 0,
    totalChords: (row[1] as number) || 0,
    totalMinutes: (row[2] as number) || 0,
  }
}

export async function deleteSession(sessionId: number): Promise<void> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  db.run('DELETE FROM practice_sessions WHERE id = ?', [sessionId])
  await saveDatabaseToStorage()
}

export async function clearAllHistory(): Promise<void> {
  if (!db) await initializeDatabase()
  if (!db) throw new Error('Database not initialized')

  db.run('DELETE FROM practice_sessions')
  await saveDatabaseToStorage()
}
