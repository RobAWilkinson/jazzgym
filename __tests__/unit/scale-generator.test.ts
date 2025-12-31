import { describe, it, expect } from 'vitest';
import { getAvailableScales, selectRandomScale, getAllScaleTypes, SCALE_LIBRARY } from '@/lib/scale-generator';
import type { ScaleType } from '@/lib/types';

describe('Scale Generator', () => {
  describe('SCALE_LIBRARY', () => {
    it('should have 170 scales (10 types × 17 roots)', () => {
      expect(SCALE_LIBRARY.length).toBe(170);
    });

    it('should have scales with all required properties', () => {
      SCALE_LIBRARY.forEach((scale) => {
        expect(scale).toHaveProperty('root');
        expect(scale).toHaveProperty('type');
        expect(scale).toHaveProperty('displayName');
        expect(typeof scale.displayName).toBe('string');
        expect(scale.displayName.length).toBeGreaterThan(0);
      });
    });

    it('should have scales covering all scale types', () => {
      const types = new Set(SCALE_LIBRARY.map(s => s.type));
      expect(types.has('Major')).toBe(true);
      expect(types.has('Natural Minor')).toBe(true);
      expect(types.has('Harmonic Minor')).toBe(true);
      expect(types.has('Melodic Minor')).toBe(true);
      expect(types.has('Dorian')).toBe(true);
      expect(types.has('Mixolydian')).toBe(true);
      expect(types.has('Altered')).toBe(true);
      expect(types.has('Lydian')).toBe(true);
      expect(types.has('Phrygian')).toBe(true);
      expect(types.has('Locrian')).toBe(true);
    });

    it('should have 17 scales per type', () => {
      const scaleTypes = getAllScaleTypes();
      scaleTypes.forEach(type => {
        const scalesOfType = SCALE_LIBRARY.filter(s => s.type === type);
        expect(scalesOfType.length).toBe(17); // 17 chromatic roots
      });
    });
  });

  describe('getAllScaleTypes', () => {
    it('should return all 10 scale types', () => {
      const types = getAllScaleTypes();

      expect(types).toContain('Major');
      expect(types).toContain('Natural Minor');
      expect(types).toContain('Harmonic Minor');
      expect(types).toContain('Melodic Minor');
      expect(types).toContain('Dorian');
      expect(types).toContain('Mixolydian');
      expect(types).toContain('Altered');
      expect(types).toContain('Lydian');
      expect(types).toContain('Phrygian');
      expect(types).toContain('Locrian');
      expect(types.length).toBe(10);
    });

    it('should return unique types', () => {
      const types = getAllScaleTypes();
      const uniqueTypes = Array.from(new Set(types));

      expect(types.length).toBe(uniqueTypes.length);
    });
  });

  describe('getAvailableScales', () => {
    it('should return all 170 scales when all types are selected', () => {
      const allTypes = getAllScaleTypes();
      const available = getAvailableScales(allTypes);

      expect(available.length).toBe(170);
    });

    it('should filter scales by type', () => {
      const majorScales = getAvailableScales(['Major']);

      expect(majorScales.length).toBe(17); // 17 chromatic roots
      majorScales.forEach(scale => {
        expect(scale.type).toBe('Major');
      });
    });

    it('should filter scales by multiple types', () => {
      const selected = getAvailableScales(['Major', 'Natural Minor']);

      expect(selected.length).toBe(34); // 17 × 2
      selected.forEach(scale => {
        expect(['Major', 'Natural Minor']).toContain(scale.type);
      });
    });

    it('should throw error when filtering by no types', () => {
      expect(() => {
        getAvailableScales([]);
      }).toThrow('No scale types selected');
    });

    it('should handle single type selection', () => {
      const dorianScales = getAvailableScales(['Dorian']);

      expect(dorianScales.length).toBe(17);
      dorianScales.forEach(scale => {
        expect(scale.type).toBe('Dorian');
      });
    });

    it('should filter correctly with 7 default types', () => {
      const defaultTypes: ScaleType[] = [
        'Major',
        'Natural Minor',
        'Harmonic Minor',
        'Melodic Minor',
        'Dorian',
        'Mixolydian',
        'Altered'
      ];
      const scales = getAvailableScales(defaultTypes);

      expect(scales.length).toBe(119); // 7 × 17
      scales.forEach(scale => {
        expect(defaultTypes).toContain(scale.type);
      });
    });
  });

  describe('selectRandomScale', () => {
    it('should select a scale from available scales', () => {
      const allTypes = getAllScaleTypes();
      const availableScales = getAvailableScales(allTypes);
      const scale = selectRandomScale(availableScales);

      expect(scale).toBeDefined();
      expect(availableScales).toContainEqual(scale);
    });

    it('should only select from filtered types', () => {
      const majorOnly: ScaleType[] = ['Major'];
      const availableScales = getAvailableScales(majorOnly);
      const scale = selectRandomScale(availableScales);

      expect(scale.type).toBe('Major');
    });

    it('should select different scales over multiple calls', () => {
      const allTypes = getAllScaleTypes();
      const availableScales = getAvailableScales(allTypes);
      const scales = new Set();

      // Select 50 random scales
      for (let i = 0; i < 50; i++) {
        const scale = selectRandomScale(availableScales);
        scales.add(scale.displayName);
      }

      // Should have selected more than 1 unique scale (very high probability)
      expect(scales.size).toBeGreaterThan(1);
    });

    it('should throw error when scale array is empty', () => {
      expect(() => {
        selectRandomScale([]);
      }).toThrow('No scales available');
    });

    it('should handle edge case of single scale type', () => {
      const alteredOnly: ScaleType[] = ['Altered'];
      const availableScales = getAvailableScales(alteredOnly);
      const scale = selectRandomScale(availableScales);

      expect(scale.type).toBe('Altered');
    });

    it('should return valid scale objects', () => {
      const allTypes = getAllScaleTypes();
      const availableScales = getAvailableScales(allTypes);
      const scale = selectRandomScale(availableScales);

      expect(scale).toHaveProperty('root');
      expect(scale).toHaveProperty('type');
      expect(scale).toHaveProperty('displayName');
      expect(typeof scale.displayName).toBe('string');
      expect(scale.displayName.length).toBeGreaterThan(0);
    });

    it('should prevent consecutive duplicates when previousScale is provided', () => {
      const majorScales = getAvailableScales(['Major', 'Natural Minor']);
      const firstScale = selectRandomScale(majorScales);

      // Select next scale 20 times - should never get the same scale
      for (let i = 0; i < 20; i++) {
        const nextScale = selectRandomScale(majorScales, firstScale);
        // With 34 scales available, should never repeat
        expect(nextScale.displayName).not.toBe(firstScale.displayName);
      }
    });

    it('should handle single scale gracefully by returning it', () => {
      const singleScaleArray = [SCALE_LIBRARY[0]];
      const scale = selectRandomScale(singleScaleArray);

      expect(scale).toBe(SCALE_LIBRARY[0]);

      // Even with previous scale, should return the only available scale
      const scaleAgain = selectRandomScale(singleScaleArray, SCALE_LIBRARY[0]);
      expect(scaleAgain).toBe(SCALE_LIBRARY[0]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle repetitive selections without errors', () => {
      const allTypes = getAllScaleTypes();
      const availableScales = getAvailableScales(allTypes);

      expect(() => {
        for (let i = 0; i < 1000; i++) {
          selectRandomScale(availableScales);
        }
      }).not.toThrow();
    });

    it('should properly filter combinations of scale types', () => {
      const types: ScaleType[] = ['Major', 'Dorian', 'Altered'];
      const scales = getAvailableScales(types);

      expect(scales.length).toBe(51); // 3 × 17
      scales.forEach(scale => {
        expect(types).toContain(scale.type);
      });
    });

    it('should handle duplicate prevention over long sequence', () => {
      const scales = getAvailableScales(['Major', 'Natural Minor', 'Dorian']);
      let currentScale = selectRandomScale(scales);

      // Generate 100 scales, ensuring no consecutive duplicates
      for (let i = 0; i < 100; i++) {
        const nextScale = selectRandomScale(scales, currentScale);
        if (scales.length > 1) {
          expect(nextScale.displayName).not.toBe(currentScale.displayName);
        }
        currentScale = nextScale;
      }
    });
  });
});
