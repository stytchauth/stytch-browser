import { StytchSDKUsageError } from '../public';

/**
 * This function and its parameter is stripped in production builds using rollup plugin.
 * NOTE: Be careful when wrapping render function return values. React before v18 do not allow undefined
 *       to be returned, so wrapping the entire return value will crash those runtimes.
 */
export const DEV = <T>(input: T): T | undefined => input;

/**
 * This function is stripped in production builds using rollup plugin. Useful for adding
 * logging or validation in dev only
 */
export function RUN_IN_DEV(callback: () => void) {
  callback();
}

export type ValidateRule =
  | 'object'
  | 'optionalObject'
  | 'string'
  | 'optionalString'
  | 'number'
  | 'optionalNumber'
  | 'stringArray'
  | 'optionalStringArray'
  | 'boolean'
  | 'optionalBoolean';

export const validateInDev = <T extends Record<string, unknown>>(
  methodName: string,
  obj: T,
  rules: Partial<Record<keyof T, ValidateRule>>,
) => {
  const errors: StytchSDKUsageError[] = [];
  for (const [key, rule] of Object.entries(rules)) {
    if (rule == null) continue;

    const val = obj[key];
    if (rule.startsWith('optional') && val == null) continue;

    switch (rule) {
      case 'object':
      case 'optionalObject': {
        const isObject = typeof val === 'object' && !Array.isArray(val) && val !== null;
        if (!isObject) {
          errors.push(new StytchSDKUsageError(methodName, `${key} must be an object.`));
        }
        break;
      }

      case 'string':
      case 'optionalString':
        if (typeof val !== 'string') {
          errors.push(new StytchSDKUsageError(methodName, `${key} must be a string.`));
        }
        break;

      case 'number':
      case 'optionalNumber':
        if (typeof val !== 'number') {
          errors.push(new StytchSDKUsageError(methodName, `${key} must be a number.`));
        }
        break;

      case 'stringArray':
      case 'optionalStringArray':
        if (!Array.isArray(val) || !val.every((str) => typeof str === 'string')) {
          errors.push(new StytchSDKUsageError(methodName, `${key} must be an array of strings.`));
        }
        break;

      case 'boolean':
      case 'optionalBoolean':
        if (typeof val !== 'boolean') {
          errors.push(new StytchSDKUsageError(methodName, `${key} must be a boolean.`));
        }
        break;
    }
  }

  if (errors.length > 0) {
    if (errors.length === 1) {
      throw errors[0];
    } else {
      throw new AggregateError(errors);
    }
  }
};
