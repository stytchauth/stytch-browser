import { v4 as uuidv4 } from 'uuid';

import { OTPMethods, ResponseCommon, User, StytchSDKUsageError } from '../public';

export type { Cacheable } from './Cacheable';
export type { EnumOrStringLiteral, StringLiteralFromEnum } from './EnumOrStringLiteral';
export { loadESModule } from './loadESModule';
export * from './api';
export * from './checks';
export * from './country';
export * from './dfp';
export * from './logger';

export { arrayUtils } from './arrayUtils';

export const isTestPublicToken = (token: string) => token.includes('public-token-test');

/**
 * Normalizes an es5 promise with a .then(onSuccess, onFailure) signature to
 * the es6 .then().catch() signature
 */
export const normalizePromiseLike = <T>(prom: PromiseLike<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    prom.then(resolve, reject);
  });
};

export const createEventId = () => `event-id-${uuidv4()}`;
export const createAppSessionId = () => `app-session-id-${uuidv4()}`;
export const createPersistentId = () => `persistent-id-${uuidv4()}`;

export const validate = (methodName: string) => {
  const validator = {
    isObject: (fieldName: string, value: object) => {
      const isObject = typeof value === 'object' && !Array.isArray(value) && value !== null;
      if (!isObject) {
        throw new StytchSDKUsageError(methodName, fieldName + ' must be an object.');
      }
      return validator;
    },
    isOptionalObject: (fieldName: string, value: object | undefined) => {
      if (typeof value === 'undefined') {
        return validator;
      }
      return validator.isObject(fieldName, value);
    },
    isString: (fieldName: string, value: string) => {
      if (typeof value !== 'string') {
        throw new StytchSDKUsageError(methodName, fieldName + ' must be a string.');
      }
      return validator;
    },
    isOptionalString: (fieldName: string, value: string | undefined) => {
      if (typeof value === 'undefined') {
        return validator;
      }
      return validator.isString(fieldName, value);
    },
    isStringArray: (fieldName: string, value: string[]) => {
      if (!Array.isArray(value)) {
        throw new StytchSDKUsageError(methodName, fieldName + ' must be an array of strings.');
      }
      for (const str of value) {
        if (typeof str !== 'string') {
          throw new StytchSDKUsageError(methodName, fieldName + ' must be an array of strings.');
        }
      }
      return validator;
    },
    isOptionalStringArray: (fieldName: string, value: string[] | undefined) => {
      if (typeof value === 'undefined') {
        return validator;
      }
      return validator.isStringArray(fieldName, value);
    },
    isNumber: (fieldName: string, value: number) => {
      if (typeof value !== 'number') {
        throw new StytchSDKUsageError(methodName, fieldName + ' must be a number.');
      }
      return validator;
    },
    isOptionalNumber: (fieldName: string, value: number | undefined) => {
      if (typeof value === 'undefined') {
        return validator;
      }
      return validator.isNumber(fieldName, value);
    },
    isBoolean: (fieldName: string, value: boolean) => {
      if (typeof value !== 'boolean') {
        throw new StytchSDKUsageError(methodName, fieldName + ' must be a boolean.');
      }
      return validator;
    },
    isOptionalBoolean: (fieldName: string, value: boolean | undefined) => {
      if (typeof value === 'undefined') {
        return validator;
      }
      return validator.isBoolean(fieldName, value);
    },
  };

  return validator;
};

export const isPhoneMethod = (selectionMethod: string) =>
  selectionMethod === OTPMethods.SMS || selectionMethod === OTPMethods.WhatsApp;
export const isEmailMethod = (selectionMethod: string) => selectionMethod === OTPMethods.Email;

export const removeResponseCommon = <T extends ResponseCommon>({
  request_id,

  status_code,
  ...rest
}: T): Omit<T, keyof ResponseCommon> => rest;

export type WithUser<T> = T & { __user: User & ResponseCommon };

export const omitUser = <T extends ResponseCommon>(resp: T & { __user: User }): T => {
  const { __user, ...rest } = resp;
  return rest as unknown as T;
};
