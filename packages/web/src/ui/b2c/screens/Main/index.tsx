import { useLingui } from '@lingui/react/macro';
import { DEV } from '@stytch/core';
import React, { useEffect, useState } from 'react';

import { isTruthy } from '../../../../utils/isTruthy';
import Column from '../../../components/atoms/Column';
import Typography from '../../../components/atoms/Typography';
import Divider from '../../../components/molecules/Divider';
import ErrorText from '../../../components/molecules/ErrorText';
import { usePresentation } from '../../../components/PresentationConfig';
import { usePromptPasskey } from '../../../hooks/usePromptPasskey';
import { useConfig, useStytch } from '../../GlobalContextProvider';
import { MainScreenGroup, MainScreenKey } from '../../StytchProduct';
import { hasProduct, useProductComponents } from '../../utils';

export const MainScreen = () => {
  const stytchClient = useStytch();
  const config = useConfig();

  const { options } = usePresentation();
  const { t } = useLingui();
  const [mainScreenGroups, setMainScreenGroups] = useState<MainScreenGroup[]>([]);

  const { products, oauthOptions } = config;
  const hasButtons = (hasProduct(products, 'oauth') && oauthOptions) || hasProduct(products, 'crypto');
  const hasPasskeys = hasProduct(products, 'passkeys');
  const hasInput =
    hasProduct(products, 'emailMagicLinks') || hasProduct(products, 'otp') || hasProduct(products, 'passwords');

  const [startPasskeyAuth, passkeyError] = usePromptPasskey({
    canAutofill: hasInput,
    shadowDOM: Boolean(options.enableShadowDOM),
  });
  const productComponents = useProductComponents(products, 'mainScreen')!;

  useEffect(() => {
    const loadProductComponents = async () => {
      // Deduplicate components mapped from products
      const keys = Array.from(
        new Set<MainScreenKey>(
          products
            .map((product) => {
              switch (product.id) {
                case 'oauth':
                case 'crypto':
                  return product.id;
                case 'emailMagicLinks':
                case 'otp':
                case 'passwords':
                  return 'login-form';
              }
            })
            .filter(isTruthy),
        ),
      );

      const showDivider = hasButtons && hasInput;
      if (keys.length > 1 && showDivider) {
        keys.splice(-1, 0, 'divider');
      }

      // Add a passkey button if the user has configured passkeys, don't have a login form,
      // or the browser does not support autofill
      if (hasPasskeys && (!hasInput || !(await stytchClient.webauthn.browserSupportsAutofill()))) {
        keys.unshift('passkey-button');
      }

      // Group Wallet and Oauth buttons (basically going from [Password, Wallet, OAuth] to [Password, [Wallet, OAuth]])
      // This reassignment is only there to make TS happy - .splice mutates, and groups === keys
      // so it is not really needed
      const groups: MainScreenGroup[] = keys;
      const walletIndex = keys.indexOf('crypto');
      const oauthIndex = keys.indexOf('oauth');
      if (walletIndex !== -1 && oauthIndex !== -1 && Math.abs(walletIndex - oauthIndex) === 1) {
        const index = Math.min(walletIndex, oauthIndex);
        groups.splice(index, 0, keys.splice(index, 2));
      }

      setMainScreenGroups(groups);
    };

    loadProductComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  if (hasPasskeys && products.length === 1)
    return (
      <Typography variant="helper" color="destructive">
        {DEV('Error: Cannot use Passkeys by itself, please add another product to the config.')}
      </Typography>
    );

  const props = { startPasskeyAuth };
  const renderComponent = (key: MainScreenGroup, index: number) => {
    if (Array.isArray(key)) {
      return (
        <Column gap={2} key={index}>
          {key.map(renderComponent)}
        </Column>
      );
    }

    if (key === 'divider') {
      return <Divider key={index} />;
    }

    const Component = productComponents[key];
    return <Component key={key} {...props} />;
  };

  return (
    <Column gap={6}>
      {!options.hideHeaderText && (
        <Typography variant="header" align="center">
          {t({ id: 'login.title', message: 'Sign up or log in' })}
        </Typography>
      )}

      {passkeyError && <ErrorText>{passkeyError}</ErrorText>}

      {mainScreenGroups.map(renderComponent)}
    </Column>
  );
};
