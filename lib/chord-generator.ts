import { Chord, ChordType, ChordRoot, ChordQuality } from './types'

// Comprehensive jazz chord library (~300 chords)
export const CHORD_LIBRARY: Chord[] = [
  // Major chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: 'maj' as ChordQuality, type: 'Major' as ChordType, displayName: `${root}` },
    { root, quality: 'maj7' as ChordQuality, type: 'Major' as ChordType, displayName: `${root}maj7` },
    { root, quality: 'maj9' as ChordQuality, type: 'Major' as ChordType, displayName: `${root}maj9` },
    { root, quality: 'maj13' as ChordQuality, type: 'Major' as ChordType, displayName: `${root}maj13` },
  ]),

  // Minor chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: 'm' as ChordQuality, type: 'Minor' as ChordType, displayName: `${root}m` },
    { root, quality: 'm7' as ChordQuality, type: 'Minor' as ChordType, displayName: `${root}m7` },
    { root, quality: 'm9' as ChordQuality, type: 'Minor' as ChordType, displayName: `${root}m9` },
    { root, quality: 'm11' as ChordQuality, type: 'Minor' as ChordType, displayName: `${root}m11` },
    { root, quality: 'm13' as ChordQuality, type: 'Minor' as ChordType, displayName: `${root}m13` },
  ]),

  // Dominant chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: '7' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}7` },
    { root, quality: '9' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}9` },
    { root, quality: '13' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}13` },
    { root, quality: '7#9' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}7#9` },
    { root, quality: '7b9' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}7b9` },
    { root, quality: '7#5' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}7#5` },
    { root, quality: '7b5' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}7b5` },
    { root, quality: 'alt' as ChordQuality, type: 'Dominant' as ChordType, displayName: `${root}alt` },
  ]),

  // Diminished chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: 'dim' as ChordQuality, type: 'Diminished' as ChordType, displayName: `${root}dim` },
    { root, quality: 'dim7' as ChordQuality, type: 'Diminished' as ChordType, displayName: `${root}dim7` },
    { root, quality: 'm7b5' as ChordQuality, type: 'Diminished' as ChordType, displayName: `${root}m7b5` },
  ]),

  // Augmented chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: 'aug' as ChordQuality, type: 'Augmented' as ChordType, displayName: `${root}aug` },
    { root, quality: 'maj7#5' as ChordQuality, type: 'Augmented' as ChordType, displayName: `${root}maj7#5` },
  ]),

  // Suspended chords
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ChordRoot[]).flatMap(root => [
    { root, quality: 'sus2' as ChordQuality, type: 'Suspended' as ChordType, displayName: `${root}sus2` },
    { root, quality: 'sus4' as ChordQuality, type: 'Suspended' as ChordType, displayName: `${root}sus4` },
    { root, quality: '7sus4' as ChordQuality, type: 'Suspended' as ChordType, displayName: `${root}7sus4` },
  ]),
]

/**
 * Get all available chord type categories
 */
export function getAllChordTypes(): ChordType[] {
  return ['Major', 'Minor', 'Dominant', 'Diminished', 'Augmented', 'Suspended', 'Extended']
}

/**
 * Filter chord library by enabled chord types
 * @throws Error if enabledTypes is empty
 */
export function getAvailableChords(enabledTypes: ChordType[]): Chord[] {
  if (enabledTypes.length === 0) {
    throw new Error('No chord types selected. At least one chord type must be enabled.')
  }

  return CHORD_LIBRARY.filter(chord => enabledTypes.includes(chord.type))
}

/**
 * Select a random chord from the available pool
 * @throws Error if availableChords is empty
 */
export function selectRandomChord(availableChords: Chord[]): Chord {
  if (availableChords.length === 0) {
    throw new Error('No chords available with current filters. Please enable at least one chord type.')
  }

  const randomIndex = Math.floor(Math.random() * availableChords.length)
  return availableChords[randomIndex]
}
