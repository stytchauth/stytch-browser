import { v4 as uuidv4 } from 'uuid';

import { OTPMethods, ResponseCommon, User } from '../public';

export * from './api';
export { arrayUtils } from './arrayUtils';
export type { Cacheable } from './Cacheable';
export * from './checks';
export * from './country';
export * from './dfp';
export type { EnumOrStringLiteral, StringLiteralFromEnum } from './EnumOrStringLiteral';
export { loadESModule } from './loadESModule';
export * from './logger';

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

export type Values<T extends object> = T[keyof T];

// A simplified version of PartialDeep from type-fest to avoid referencing that package in exported types
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type _PartialDeep<T> = T extends Primitive
  ? T //
  : T extends object
    ? PartialObjectDeep<T>
    : unknown;

type PartialObjectDeep<ObjectType extends object> = {
  [KeyType in keyof ObjectType]?: _PartialDeep<ObjectType[KeyType]>;
};

export type PartialDeep<T> = _PartialDeep<T>;
