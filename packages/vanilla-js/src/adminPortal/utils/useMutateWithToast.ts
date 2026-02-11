import { useCallback } from 'react';
import { useToast } from '../components/Toast';

export interface MutationOptions {
  errorMessage?: string | ((e: unknown) => string);
}

export type MutationFn<T, TReturn> = (properties: T, options?: MutationOptions) => Promise<TReturn>;

export const useMutateWithToast = <TParams, TReturn = void>(callback: (params: TParams) => Promise<TReturn>) => {
  const { openToast } = useToast();

  const mutate = useCallback<MutationFn<TParams, TReturn>>(
    async (properties, { errorMessage } = {}) => {
      try {
        return await callback(properties);
      } catch (e) {
        if (errorMessage) {
          openToast({ type: 'error', text: typeof errorMessage === 'function' ? errorMessage(e) : errorMessage });
        }
        throw e;
      }
    },
    [callback, openToast],
  );

  return { mutate };
};
