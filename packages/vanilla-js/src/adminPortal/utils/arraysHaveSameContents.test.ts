import { arraysHaveSameContents } from './arraysHaveSameContents';

describe('arraysHaveSameContents', () => {
  it('returns true for empty inputs', () => {
    expect(arraysHaveSameContents([], [])).toBe(true);
  });

  it('returns true for equal arrays', () => {
    expect(arraysHaveSameContents([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arraysHaveSameContents([1, 2, 3], [1, 3, 2])).toBe(true);
  });

  it('returns false for arrays with different elements', () => {
    expect(arraysHaveSameContents([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('returns false for arrays with different lengths', () => {
    expect(arraysHaveSameContents([1, 2, 3], [1, 2])).toBe(false);
    expect(arraysHaveSameContents([1, 2, 3], [1, 2, 3, 4])).toBe(false);
    expect(arraysHaveSameContents([], [1])).toBe(false);
  });

  it('returns false for non-array inputs', () => {
    expect(arraysHaveSameContents([1, 2, 3], undefined)).toBe(false);
    expect(arraysHaveSameContents(undefined, [1, 2, 3])).toBe(false);
    expect(arraysHaveSameContents(undefined, undefined)).toBe(false);
  });
  it('returns true for non-primitave elements', () => {
    expect(arraysHaveSameContents([[1, 2], 2, 3], [[1, 2], 2, 3])).toBe(true);
    expect(arraysHaveSameContents([{ test: '123' }, 2, 3], [{ test: '123' }, 2, 3])).toBe(true);
  });
});
