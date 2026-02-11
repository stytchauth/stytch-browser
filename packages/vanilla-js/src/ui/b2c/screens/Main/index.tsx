import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useLingui } from '@lingui/react/macro';
import { useConfig, useStytch } from '../../GlobalContextProvider';
import { Products } from '@stytch/core/public';
import { Divider } from '../../../components/Divider';
import { OAuthButtons } from './OAuthButtons';
import { LoginForm } from './LoginForm';
import { CryptoWalletButtons } from '../Crypto/WalletButtons';
import { Text } from '../../../components/Text';
import { Flex } from '../../../components/Flex';
import { PasskeyButton } from './LoginForm/PasskeyButton';
import { isTruthy } from '../../../../utils/isTruthy';
import { usePromptPasskey } from '../../../hooks/usePromptPasskey';
import { AlertBox } from '../../../components/AlertBox';

/* Spacing between crypto & oauth products is 8px.
 * Spacing between other products and header elements is 24px
 */

const Container = styled(Flex)`
  .oauth-buttons + .wallet-buttons {
    margin-top: 8px;
  }
  .wallet-buttons + .oauth-buttons {
    margin-top: 8px;
  }
  > * + * {
    margin-top: 24px;
  }
`;

const Logo = styled.img`
  max-height: 50px;
  max-width: 100px;
`;

type ProductComponentKey = 'oauth' | 'crypto' | 'login-form' | 'divider' | 'passkey-button';

export const MainScreen = () => {
  const stytchClient = useStytch();
  const config = useConfig();

  const { displayHeader, logo } = useTheme();
  const { t } = useLingui();
  const [productComponents, setProductComponents] = useState<ProductComponentKey[]>([]);

  const { products, oauthOptions } = config;
  const hasButtons = (products.includes(Products.oauth) && oauthOptions) || products.includes(Products.crypto);
  const hasPasskeys = products.includes(Products.passkeys);
  const hasInput =
    products.includes(Products.emailMagicLinks) ||
    products.includes(Products.otp) ||
    products.includes(Products.passwords);

  const [startPasskeyAuth, passkeyError] = usePromptPasskey({ canAutofill: hasInput });

  useEffect(() => {
    const loadProductComponents = async () => {
      // Deduplicate components mapped from products
      const keys = Array.from(
        new Set<ProductComponentKey>(
          products
            .map((product) => {
              switch (product) {
                case Products.oauth:
                case Products.crypto:
                  return product;
                case Products.emailMagicLinks:
                case Products.otp:
                case Products.passwords:
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

      setProductComponents(keys);
    };

    loadProductComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  if (hasPasskeys && products.length === 1)
    // eslint-disable-next-line lingui/no-unlocalized-strings -- string intended for developer
    return <Text size="helper">Error: Cannot use Passkeys by itself, please add another product to the config.</Text>;

  return (
    <Container direction="column">
      {logo.logoImageUrl !== '' && (
        <Flex justifyContent="center">
          <Logo src={logo.logoImageUrl} />
        </Flex>
      )}

      {displayHeader && (
        <Flex justifyContent="center">
          <Text size="header">{t({ id: 'login.title', message: 'Sign up or log in' })}</Text>
        </Flex>
      )}

      {passkeyError && <AlertBox variant="warning" text={passkeyError} />}

      {productComponents.map((key) => {
        switch (key) {
          case 'oauth':
            return <OAuthButtons key={key} />;

          case 'crypto':
            return <CryptoWalletButtons type="main" key={key} />;

          case 'login-form':
            return <LoginForm key={key} />;

          case 'passkey-button':
            return <PasskeyButton startPasskeyAuth={startPasskeyAuth} key={key} />;

          case 'divider':
            return <Divider key={key} />;
        }
      })}
    </Container>
  );
};
