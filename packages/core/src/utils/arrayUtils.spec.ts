import { arrayUtils } from './arrayUtils';

const { moveToFront } = arrayUtils;

describe('arrayUtils', () => {
  describe(moveToFront, () => {
    it('should move matching item to front and return true when item is found', () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (item: number) => item === 3;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(true);
      expect(reorderedArray).toEqual([3, 1, 2, 4, 5]);
      expect(array).toEqual([1, 2, 3, 4, 5]); // Original array should be unchanged
    });

    it('should return false and unchanged array when no matching item is found', () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (item: number) => item === 6;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(false);
      expect(reorderedArray).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return false for empty array', () => {
      const array: number[] = [];
      const predicate = (item: number) => item === 1;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(false);
      expect(reorderedArray).toEqual([]);
    });

    it('should return false for array with single item', () => {
      const array = [1];
      const predicate = (item: number) => item === 1;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(false);
      expect(reorderedArray).toEqual([1]);
    });

    it('should move first matching item to front when multiple items match predicate', () => {
      const array = [1, 2, 2, 3, 2];
      const predicate = (item: number) => item === 2;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(true);
      expect(reorderedArray).toEqual([2, 1, 2, 3, 2]); // First occurrence of 2 moved to front
    });

    it('should handle item already at front', () => {
      const array = [1, 2, 3, 4, 5];
      const predicate = (item: number) => item === 1;

      const [reorderedArray, foundMatch] = moveToFront(array, predicate);

      expect(foundMatch).toBe(true);
      expect(reorderedArray).toEqual([1, 2, 3, 4, 5]); // Array remains the same
    });
  });
});
