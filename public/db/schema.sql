-- JazzGym Chord Flashcards Database Schema
-- SQLite database for client-side storage via sql.js

-- User preferences (singleton table)
CREATE TABLE IF NOT EXISTS preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  time_limit INTEGER NOT NULL DEFAULT 10 CHECK (time_limit >= 3 AND time_limit <= 60),
  enabled_chord_types TEXT NOT NULL DEFAULT '["Major","Minor","Dominant","Diminished","Augmented","Suspended","Extended"]'
);

-- Insert default preferences
INSERT OR IGNORE INTO preferences (id, time_limit, enabled_chord_types)
VALUES (1, 10, '["Major","Minor","Dominant","Diminished","Augmented","Suspended","Extended"]');

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  chord_count INTEGER NOT NULL DEFAULT 0 CHECK (chord_count >= 0),
  time_limit INTEGER NOT NULL CHECK (time_limit >= 3 AND time_limit <= 60)
);

CREATE INDEX IF NOT EXISTS idx_sessions_started ON practice_sessions(started_at DESC);

-- Session chords (junction table tracking individual chords in each session)
CREATE TABLE IF NOT EXISTS session_chords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  chord_name TEXT NOT NULL CHECK (length(chord_name) > 0),
  displayed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_chords_session ON session_chords(session_id);
CREATE INDEX IF NOT EXISTS idx_session_chords_displayed ON session_chords(displayed_at);
