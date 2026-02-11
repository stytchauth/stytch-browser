import { cannotInvokeMethodOnServerError } from './utils/errors';

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
    get(target: unknown, p: string | symbol) {
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

export const createStytchSSRProxy = () => createProxy('stytch');
