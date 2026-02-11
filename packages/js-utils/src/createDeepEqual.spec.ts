import { createDeepEqual } from './createDeepEqual';

describe('deepEqual', () => {
  const deepEqual = createDeepEqual();
  it('string equality', () => {
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual('a', 'b')).toBe(false);
  });
  it('boolean equality', () => {
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(true, false)).toBe(false);
  });
  it('undefined equality', () => {
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(undefined, 'undefined')).toBe(false);
  });
  it('null equality', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, {})).toBe(false);
  });
  it('array equality', () => {
    expect(deepEqual([1, true, 'a'], [1, true, 'a'])).toBe(true);
    expect(deepEqual([1, true, 'a'], [1, true, 'b'])).toBe(false);
  });
  it('object equality', () => {
    expect(deepEqual({ a: 1, b: true, c: 'a' }, { a: 1, b: true, c: 'a' })).toBe(true);
    expect(deepEqual({ a: 1, b: true, c: 'a' }, { a: 1, b: true, c: 'b' })).toBe(false);
    expect(deepEqual({ a: 1, b: true, c: 'a' }, { a: 1, b: true, d: 'a' })).toBe(false);
  });
  it('nested equality', () => {
    expect(
      deepEqual(
        { a: [[1, 2], 3], b: { a: [], b: { a: true } }, c: 'a' },
        { a: [[1, 2], 3], b: { a: [], b: { a: true } }, c: 'a' },
      ),
    ).toBe(true);
    expect(
      deepEqual(
        { a: [[1, 2], 3], b: { a: [], b: { a: true } }, c: 'a' },
        { a: [[1, 3], 3], b: { a: [], b: { a: true } }, c: 'a' },
      ),
    ).toBe(false);
  });

  it('deep equality', () => {
    expect(
      deepEqual(
        { a: [[1, 2], 3], b: { a: [], b: { a: true } }, c: 'a' },
        { a: [[1, 2], 3], b: { a: [], b: { a: false } }, c: 'a' },
      ),
    ).toBe(false);
  });

  it('Can be configured to ignore keys', () => {
    const deepEqualIgnoreA = createDeepEqual({
      KEYS_TO_EXCLUDE: ['a'],
    });
    expect(deepEqualIgnoreA({ a: 1, b: true }, { a: 1, b: true })).toBe(true);
    expect(deepEqualIgnoreA({ a: 1, b: true }, { a: 2, b: true })).toBe(true);
    expect(deepEqualIgnoreA({ a: 1, b: true }, { a: 1, b: false })).toBe(false);
  });
});
