import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { EnumOrStringLiteral } from '@stytch/core';
import { OTPMethods, Products } from '@stytch/core/public';
import styled from 'styled-components';
import { useConfig } from '../../../GlobalContextProvider';
import { OTPEmailForm, PhoneForm } from './OTPForm';
import { MagicLinkEmailForm } from './MagicLinkForm';
import { PasswordsEmailForm } from './PasswordForm';
import { Text } from '../../../../components/Text';
import type { MessageDescriptor } from '@lingui/core';
import { focusedRing } from '../../../../../utils/accessibility';

const TabList = styled(Tabs.List)`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.colors.secondary};
  margin-bottom: 24px;
`;

const TabTrigger = styled(Tabs.Trigger)<{ $active: boolean }>`
  all: unset;
  width: 100%;
  text-align: center;
  color: ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.secondary)};
  border-bottom: 3px solid ${(props) => (props.$active ? props.theme.colors.primary : 'transparent')};
  font-weight: ${(props) => (props.$active ? '500' : '400')};
  height: 28px;

  cursor: pointer;
  font-family: ${(props) => props.theme.typography.fontFamily};
  line-height: 1;

  &:focus-visible {
    ${focusedRing}
  }
`;

export enum MagicLinkMethods {
  Email = 'emailMagicLink',
}

export enum PasswordMethods {
  Email = 'passwords',
}

type TabMethods = EnumOrStringLiteral<OTPMethods> | MagicLinkMethods | PasswordMethods;

export const OTPTabHeaders: Record<TabMethods, MessageDescriptor> = {
  [OTPMethods.SMS]: msg({ id: 'tab.text', message: 'Text' }),
  [OTPMethods.WhatsApp]: msg({ id: 'tab.whatsapp', message: 'WhatsApp' }),
  [OTPMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
  [MagicLinkMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
  [PasswordMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
};

export const getTabMethods = (
  products: EnumOrStringLiteral<Products>[],
  otpMethods: EnumOrStringLiteral<OTPMethods>[],
) => {
  const hasPassword = products.includes(Products.passwords);

  const tabMethodsSet = products.reduce<Set<TabMethods>>((acc, product) => {
    switch (product) {
      case Products.emailMagicLinks:
        acc.add(hasPassword ? PasswordMethods.Email : MagicLinkMethods.Email);
        break;
      case Products.passwords:
        acc.add(PasswordMethods.Email);
        break;
      case Products.otp:
        otpMethods.forEach((method) => {
          acc.add(method === OTPMethods.Email && hasPassword ? PasswordMethods.Email : method);
        });
        break;
    }
    return acc;
  }, new Set<TabMethods>());

  return Array.from(tabMethodsSet);
};

const TabMethodToComponent: Record<TabMethods, React.FC> = {
  [OTPMethods.Email]: OTPEmailForm,
  [OTPMethods.WhatsApp]: () => <PhoneForm method={OTPMethods.WhatsApp} />,
  [OTPMethods.SMS]: () => <PhoneForm method={OTPMethods.SMS} />,
  [MagicLinkMethods.Email]: MagicLinkEmailForm,
  [PasswordMethods.Email]: PasswordsEmailForm,
};

export const LoginForm = () => {
  const { t } = useLingui();
  const config = useConfig();
  const productsIncludesOtp = config.products.includes(Products.otp);
  const otpMethods = productsIncludesOtp ? (config?.otpOptions?.methods ?? []) : [];
  const hasEmailMagicLink = config.products.includes(Products.emailMagicLinks);
  const hasOTPEmail = productsIncludesOtp && otpMethods.includes(OTPMethods.Email);

  const tabMethods = getTabMethods(config.products, otpMethods);

  const [currentTab, setCurrentTab] = useState<TabMethods>(tabMethods[0]);

  // eslint-disable-next-line lingui/no-unlocalized-strings -- string intended for developer
  if (hasEmailMagicLink && hasOTPEmail) return <Text size="helper">Error: Cannot use both EML and Email OTP</Text>;

  return (
    <Tabs.Root value={currentTab} onValueChange={(value) => setCurrentTab(value as TabMethods)}>
      {tabMethods.length > 1 && (
        <TabList aria-label="otp-tabs">
          {tabMethods.map((method) => (
            <TabTrigger value={method} key={method} $active={method === currentTab}>
              {t(OTPTabHeaders[method])}
            </TabTrigger>
          ))}
        </TabList>
      )}
      {tabMethods.map((method) => {
        const Component = TabMethodToComponent[method];

        if (tabMethods.length > 1) {
          return (
            <Tabs.Content value={method} key={method}>
              <Component />
            </Tabs.Content>
          );
        } else {
          return <Component key={method} />;
        }
      })}
    </Tabs.Root>
  );
};
