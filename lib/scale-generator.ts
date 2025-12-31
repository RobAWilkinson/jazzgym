import { Scale, ScaleType, ScaleRoot } from './types'

// Comprehensive scale library for jazz practice
// 7 core scale types × 12 chromatic roots = 84 scales
export const SCALE_LIBRARY: Scale[] = [
  // Major scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Major' as ScaleType,
    displayName: `${root} Major`
  })),

  // Natural Minor scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Natural Minor' as ScaleType,
    displayName: `${root} Natural Minor`
  })),

  // Harmonic Minor scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Harmonic Minor' as ScaleType,
    displayName: `${root} Harmonic Minor`
  })),

  // Melodic Minor scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Melodic Minor' as ScaleType,
    displayName: `${root} Melodic Minor`
  })),

  // Dorian scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Dorian' as ScaleType,
    displayName: `${root} Dorian`
  })),

  // Mixolydian scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Mixolydian' as ScaleType,
    displayName: `${root} Mixolydian`
  })),

  // Altered scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Altered' as ScaleType,
    displayName: `${root} Altered`
  })),

  // Optional scales (can be added later)
  // Lydian scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Lydian' as ScaleType,
    displayName: `${root} Lydian`
  })),

  // Phrygian scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Phrygian' as ScaleType,
    displayName: `${root} Phrygian`
  })),

  // Locrian scales
  ...(['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as ScaleRoot[]).map(root => ({
    root,
    type: 'Locrian' as ScaleType,
    displayName: `${root} Locrian`
  })),
]

/**
 * Get all available scale type categories
 */
export function getAllScaleTypes(): ScaleType[] {
  return [
    'Major',
    'Natural Minor',
    'Harmonic Minor',
    'Melodic Minor',
    'Dorian',
    'Mixolydian',
    'Altered',
    'Lydian',
    'Phrygian',
    'Locrian'
  ]
}

/**
 * Filter scale library by enabled scale types
 * @throws Error if enabledTypes is empty
 */
export function getAvailableScales(enabledTypes: ScaleType[]): Scale[] {
  if (enabledTypes.length === 0) {
    throw new Error('No scale types selected. At least one scale type must be enabled.')
  }

  return SCALE_LIBRARY.filter(scale => enabledTypes.includes(scale.type))
}

/**
 * Select a random scale from the available pool
 * Prevents consecutive duplicates if previousScale is provided
 * @param availableScales Array of scales to choose from
 * @param previousScale Optional previous scale to avoid repeating
 * @throws Error if availableScales is empty
 */
export function selectRandomScale(availableScales: Scale[], previousScale?: Scale): Scale {
  if (availableScales.length === 0) {
    throw new Error('No scales available with current filters. Please enable at least one scale type.')
  }

  // If only one scale is available, return it (even if it's the same as previous)
  if (availableScales.length === 1) {
    return availableScales[0]
  }

  // If we have a previous scale, filter it out to prevent consecutive duplicates
  let selectableScales = availableScales
  if (previousScale) {
    selectableScales = availableScales.filter(
      scale => scale.displayName !== previousScale.displayName
    )
    // If filtering removed all scales (shouldn't happen), fall back to full list
    if (selectableScales.length === 0) {
      selectableScales = availableScales
    }
  }

  const randomIndex = Math.floor(Math.random() * selectableScales.length)
  return selectableScales[randomIndex]
}
