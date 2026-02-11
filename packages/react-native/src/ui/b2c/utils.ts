import { StytchAPIError, StytchSDKError } from '@stytch/core/public';

import { ErrorResponse } from '../shared/types';

export const createErrorResponseFromError = (e: unknown): ErrorResponse | undefined => {
  if (e instanceof StytchSDKError) {
    return { sdkError: e };
  }
  if (e instanceof StytchAPIError) {
    return { apiError: e };
  }
  return undefined;
};
