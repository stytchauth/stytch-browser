import { mergeWithStableProps } from './mergeWithStableProps';

describe('mergeWithStableProps', () => {
  it('Handles inputs that are entirely deeply equal', () => {
    const oldValue = { a: { test: 'value' }, b: { other: 'object' } };
    const newValue = { a: { test: 'value' }, b: { other: 'object' } };

    const { a, b, ...rest } = mergeWithStableProps(oldValue, newValue);
    expect(a).toBe(oldValue.a);
    expect(b).toBe(oldValue.b);
    expect(rest).toStrictEqual({});
  });

  it('Handles inputs with deeply equal, unequal, and missing slices', () => {
    const oldValue = { a: { test: 'value' }, b: { other: 'object' }, d: 'only-in-old' };
    const newValue = { a: { test: 'value', thing: 'bar' }, b: { other: 'object' }, c: 'extra' };

    const { a, b, c, ...rest } = mergeWithStableProps(oldValue, newValue);
    expect(a).toBe(newValue.a);
    expect(b).toBe(oldValue.b);
    expect(c).toBe(newValue.c);
    expect(rest).toStrictEqual({});
  });

  it('Handles inputs with no overlap', () => {
    const oldValue = { a: { test: 'value' }, b: { other: 'object' } };
    const newValue = { c: 'extra', d: 'new' };

    expect(mergeWithStableProps(oldValue, newValue)).toStrictEqual(newValue);
  });

  it('Handles inputs that are referentially equal', () => {
    const value = { a: { test: 'value' }, b: { other: 'object' } };

    expect(mergeWithStableProps(value, value)).toBe(value);
  });
});
