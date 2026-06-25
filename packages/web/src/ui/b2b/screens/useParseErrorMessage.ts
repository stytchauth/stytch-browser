import { useLingui } from '@lingui/react/macro';
import { StytchAPIError } from '@stytch/core/public';

import { getTranslatedError } from '../../../utils/getTranslatedError';

const JIT_PROVISIONING_ERRORS = ['email_jit_provisioning_not_allowed', 'invalid_email_for_jit_provisioning'];

/**
 * Translates error message to user friendlier format including handling for JIT errors
 */
export const useParseErrorMessage = () => {
  const { t } = useLingui();
  return (error: StytchAPIError, { email, org: organizationName }: { email: string; org: string }) => {
    if (JIT_PROVISIONING_ERRORS.includes(error.error_type)) {
      return t({
        id: 'error.jitIneligible',
        message: `${email} does not have access to ${organizationName}. If you think this is a mistake, contact your admin`,
      });
    }
    return getTranslatedError(error, t);
  };
};
