import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import Button from '../../../components/Button';
import { ErrorText } from '../../../components/ErrorText';
import { Flex } from '../../../components/Flex';

import { StytchEventType, StytchAPIError } from '@stytch/core/public';
import {
  useGlobalReducer,
  AppScreens,
  useStytch,
  useConfig,
  useErrorCallback,
  useEventCallback,
} from '../../GlobalContextProvider';
import { convertPasswordResetOptions } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';

export const PasswordlessCreate = () => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const onError = useErrorCallback();
  const onEvent = useEventCallback();
  const stytchClient = useStytch();
  const config = useConfig();
  const passwordOptions = config.passwordOptions;
  const email = state.formState.passwordState.email;
  const [errorMessage, setErrorMessage] = useState('');

  const resetPassword = () => {
    stytchClient.passwords
      .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
      .then((data) => {
        onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });
        dispatch({ type: 'transition', screen: AppScreens.PasswordSetNew });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setErrorMessage(getTranslatedError(e, t));
      });
  };

  return (
    <Flex direction="column" gap={4}>
      <Button type="button" onClick={resetPassword} variant="text">
        {t({ id: 'button.createPasswordInstead', message: 'Create a password instead' })}
      </Button>
      <ErrorText errorMessage={errorMessage} />
    </Flex>
  );
};
