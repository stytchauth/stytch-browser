import { StytchSDKUsageError } from '../public';
import { validateInDev, ValidateRule } from './dev';

describe('validateInDev', () => {
  const FIELD_NAME = 'field';

  describe('non-optional rules', () => {
    it.each([
      ['string', 'test'],
      ['number', 42],
      ['object', { key: 'value' }],
      ['boolean', true],
      ['stringArray', ['tag1', 'tag2']],
      ['stringArray', []],
    ] as const)('should pass for valid %s value', (rule: ValidateRule, value: unknown) => {
      const obj = { [FIELD_NAME]: value };
      expect(() => validateInDev('test', obj, { [FIELD_NAME]: rule })).not.toThrow();
    });

    it.each([
      ['string', 123, 'field must be a string.'],
      ['string', null, 'field must be a string.'],
      ['string', undefined, 'field must be a string.'],

      ['number', '42', 'field must be a number.'],
      ['number', null, 'field must be a number.'],
      ['number', undefined, 'field must be a number.'],

      ['object', [], 'field must be an object.'],
      ['object', null, 'field must be an object.'],
      ['object', 'not an object', 'field must be an object.'],

      ['boolean', 'true', 'field must be a boolean.'],
      ['boolean', null, 'field must be a boolean.'],
      ['boolean', 1, 'field must be a boolean.'],

      ['stringArray', 'not an array', 'field must be an array of strings.'],
      ['stringArray', ['tag1', 123], 'field must be an array of strings.'],
      ['stringArray', null, 'field must be an array of strings.'],
      ['stringArray', undefined, 'field must be an array of strings.'],
    ] as const)('should throw for invalid %s value', (rule: ValidateRule, value: unknown, expectedError: string) => {
      const obj = { [FIELD_NAME]: value };
      expect(() => validateInDev('test', obj, { [FIELD_NAME]: rule })).toThrow(expectedError);
    });
  });

  describe('optional rules', () => {
    it.each([
      ['optionalString', 'test'],
      ['optionalString', undefined],
      ['optionalString', null],
      ['optionalNumber', 42],
      ['optionalNumber', undefined],
      ['optionalNumber', null],
      ['optionalObject', { key: 'value' }],
      ['optionalObject', undefined],
      ['optionalObject', null],
      ['optionalBoolean', true],
      ['optionalBoolean', false],
      ['optionalBoolean', undefined],
      ['optionalBoolean', null],
      ['optionalStringArray', ['tag1', 'tag2']],
      ['optionalStringArray', []],
      ['optionalStringArray', undefined],
      ['optionalStringArray', null],
    ] as const)('should pass for valid %s value (including null/undefined)', (rule: ValidateRule, value: unknown) => {
      const obj = { [FIELD_NAME]: value };
      expect(() => validateInDev('test', obj, { [FIELD_NAME]: rule })).not.toThrow();
    });

    it.each([
      ['optionalString', 123, 'field must be a string.'],
      ['optionalNumber', '42', 'field must be a number.'],
      ['optionalObject', [], 'field must be an object.'],
      ['optionalObject', 'not an object', 'field must be an object.'],
      ['optionalBoolean', 'true', 'field must be a boolean.'],
      ['optionalBoolean', 1, 'field must be a boolean.'],
      ['optionalStringArray', 'not an array', 'field must be an array of strings.'],
      ['optionalStringArray', ['tag1', 123], 'field must be an array of strings.'],
    ] as const)('should throw for invalid %s value', (rule: ValidateRule, value: unknown, expectedError: string) => {
      const obj = { [FIELD_NAME]: value };
      expect(() => validateInDev('test', obj, { [FIELD_NAME]: rule })).toThrow(expectedError);
    });
  });

  describe('multiple rules', () => {
    it('should validate multiple fields', () => {
      const obj = { name: 'test', count: 42, enabled: true };
      expect(() =>
        validateInDev('test', obj, {
          name: 'string',
          count: 'number',
          enabled: 'boolean',
        }),
      ).not.toThrow();
    });

    it('should throw for all invalid fields', () => {
      const obj = { name: 123, count: 'abc' };
      expect(() =>
        validateInDev('test', obj, {
          name: 'string',
          count: 'number',
        }),
      ).toThrow(AggregateError);
    });
  });

  describe('error message format', () => {
    it('should include method name in error message', () => {
      const obj = { name: 123 };
      expect(() => validateInDev('my.custom.method', obj, { name: 'string' })).toThrow(StytchSDKUsageError);
      expect(() => validateInDev('my.custom.method', obj, { name: 'string' })).toThrow('my.custom.method');
      expect(() => validateInDev('my.custom.method', obj, { name: 'string' })).toThrow('name must be a string.');
    });
  });
});
