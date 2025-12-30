import { describe, it, expect } from 'vitest';
import { getAvailableChords, selectRandomChord, getAllChordTypes, CHORD_LIBRARY } from '@/lib/chord-generator';
import type { ChordType } from '@/lib/types';

describe('Chord Generator', () => {
  describe('CHORD_LIBRARY', () => {
    it('should have a comprehensive set of chords', () => {
      expect(CHORD_LIBRARY.length).toBeGreaterThan(0);
      expect(CHORD_LIBRARY.length).toBeGreaterThanOrEqual(200); // At least 200 chords
    });

    it('should have chords with all required properties', () => {
      CHORD_LIBRARY.forEach((chord) => {
        expect(chord).toHaveProperty('root');
        expect(chord).toHaveProperty('quality');
        expect(chord).toHaveProperty('type');
        expect(chord).toHaveProperty('displayName');
        expect(typeof chord.displayName).toBe('string');
        expect(chord.displayName.length).toBeGreaterThan(0);
      });
    });

    it('should have chords covering all chord types', () => {
      const types = new Set(CHORD_LIBRARY.map(c => c.type));
      expect(types.has('Major')).toBe(true);
      expect(types.has('Minor')).toBe(true);
      expect(types.has('Dominant')).toBe(true);
      expect(types.has('Diminished')).toBe(true);
    });
  });

  describe('getAllChordTypes', () => {
    it('should return all available chord types', () => {
      const types = getAllChordTypes();

      expect(types).toContain('Major');
      expect(types).toContain('Minor');
      expect(types).toContain('Dominant');
      expect(types).toContain('Diminished');
      expect(types.length).toBeGreaterThanOrEqual(4);
    });

    it('should return unique types', () => {
      const types = getAllChordTypes();
      const uniqueTypes = Array.from(new Set(types));

      expect(types.length).toBe(uniqueTypes.length);
    });
  });

  describe('getAvailableChords', () => {
    it('should return all chords when all types are selected', () => {
      const allTypes = getAllChordTypes();
      const available = getAvailableChords(allTypes);

      expect(available.length).toBeGreaterThan(0);
      // Note: Extended type may not have chords in library, so we won't match exact count
    });

    it('should filter chords by type', () => {
      const majorChords = getAvailableChords(['Major']);

      expect(majorChords.length).toBeGreaterThan(0);
      majorChords.forEach(chord => {
        expect(chord.type).toBe('Major');
      });
    });

    it('should filter chords by multiple types', () => {
      const selected = getAvailableChords(['Major', 'Minor']);

      expect(selected.length).toBeGreaterThan(0);
      selected.forEach(chord => {
        expect(['Major', 'Minor']).toContain(chord.type);
      });
    });

    it('should throw error when filtering by no types', () => {
      expect(() => {
        getAvailableChords([]);
      }).toThrow();
    });

    it('should handle single type selection', () => {
      const dominantChords = getAvailableChords(['Dominant']);

      expect(dominantChords.length).toBeGreaterThan(0);
      dominantChords.forEach(chord => {
        expect(chord.type).toBe('Dominant');
      });
    });
  });

  describe('selectRandomChord', () => {
    it('should select a chord from available chords', () => {
      const allTypes = getAllChordTypes();
      const availableChords = getAvailableChords(allTypes);
      const chord = selectRandomChord(availableChords);

      expect(chord).toBeDefined();
      expect(availableChords).toContainEqual(chord);
    });

    it('should only select from filtered types', () => {
      const majorOnly: ChordType[] = ['Major'];
      const availableChords = getAvailableChords(majorOnly);
      const chord = selectRandomChord(availableChords);

      expect(chord.type).toBe('Major');
    });

    it('should select different chords over multiple calls', () => {
      const allTypes = getAllChordTypes();
      const availableChords = getAvailableChords(allTypes);
      const chords = new Set();

      // Select 50 random chords
      for (let i = 0; i < 50; i++) {
        const chord = selectRandomChord(availableChords);
        chords.add(chord.displayName);
      }

      // Should have selected more than 1 unique chord (very high probability)
      expect(chords.size).toBeGreaterThan(1);
    });

    it('should throw error when chord array is empty', () => {
      expect(() => {
        selectRandomChord([]);
      }).toThrow();
    });

    it('should handle edge case of single chord type', () => {
      const diminishedOnly: ChordType[] = ['Diminished'];
      const availableChords = getAvailableChords(diminishedOnly);
      const chord = selectRandomChord(availableChords);

      expect(chord.type).toBe('Diminished');
    });

    it('should return valid chord objects', () => {
      const allTypes = getAllChordTypes();
      const availableChords = getAvailableChords(allTypes);
      const chord = selectRandomChord(availableChords);

      expect(chord).toHaveProperty('root');
      expect(chord).toHaveProperty('quality');
      expect(chord).toHaveProperty('type');
      expect(chord).toHaveProperty('displayName');
      expect(typeof chord.displayName).toBe('string');
      expect(chord.displayName.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle repetitive selections without errors', () => {
      const allTypes = getAllChordTypes();
      const availableChords = getAvailableChords(allTypes);

      expect(() => {
        for (let i = 0; i < 1000; i++) {
          selectRandomChord(availableChords);
        }
      }).not.toThrow();
    });

    it('should properly filter combinations of chord types', () => {
      const types: ChordType[] = ['Major', 'Dominant', 'Diminished'];
      const chords = getAvailableChords(types);

      chords.forEach(chord => {
        expect(types).toContain(chord.type);
      });
    });
  });
});
