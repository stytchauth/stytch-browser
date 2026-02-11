import { cannotInvokeMethodOnServerError } from '../utils/errors';

const SSRStubKey = Symbol('__stytch_SSRStubKey');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStytchSSRProxy = (proxy: any): boolean => {
  return !!proxy[SSRStubKey];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProxy = (path: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = () => {};
  return new Proxy(noop, {
    get(target, p) {
      if ((p as symbol) === SSRStubKey) {
        return true;
      }
      return createProxy(path + '.' + String(p));
    },
    apply() {
      throw new Error(cannotInvokeMethodOnServerError(path));
    },
  });
};

// Exported for testing
export const createStytchSSRProxy = () => createProxy('stytch');

export function ssrSafeClientFactory<Args extends unknown[], T>(ClientConstructor: new (...args: Args) => T) {
  return (...args: Args): T => {
    if (typeof window === 'undefined') {
      return createStytchSSRProxy();
    }

    return new ClientConstructor(...args);
  };
}
