import { MOCK_RECOVERABLE_ERROR_DATA, MOCK_UNRECOVERABLE_ERROR_DATA } from '@stytch/internal-mocks';

import { StytchAPIError } from '../public';

export const MOCK_UNRECOVERABLE_ERROR = new StytchAPIError(MOCK_UNRECOVERABLE_ERROR_DATA);

export const MOCK_RECOVERABLE_ERROR = new StytchAPIError(MOCK_RECOVERABLE_ERROR_DATA);
