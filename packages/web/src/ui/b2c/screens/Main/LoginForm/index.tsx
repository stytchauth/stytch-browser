import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { DEV } from '@stytch/core';
import { OTPMethods } from '@stytch/core/public';
import classNames from 'classnames';
import { Tabs } from 'radix-ui';
import React from 'react';

import { buttonClassNames } from '../../../../components/atoms/Button';
import Typography from '../../../../components/atoms/Typography';
import { useConfig } from '../../../GlobalContextProvider';
import { MagicLinkMethods, PasswordMethods, StytchProduct, TabMethods } from '../../../StytchProduct';
import { hasProduct, useProductComponents } from '../../../utils';
import styles from './index.module.css';

export const OTPTabHeaders: Record<TabMethods, MessageDescriptor> = {
  [OTPMethods.SMS]: msg({ id: 'tab.text', message: 'Text' }),
  [OTPMethods.WhatsApp]: msg({ id: 'tab.whatsapp', message: 'WhatsApp' }),
  [OTPMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
  [MagicLinkMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
  [PasswordMethods.Email]: msg({ id: 'tab.email', message: 'Email' }),
};

export const getTabMethods = (products: StytchProduct[], otpMethods: OTPMethods[]) => {
  const hasPassword = hasProduct(products, 'passwords');
  const tabMethods = new Set<TabMethods>();
  for (const { id } of products) {
    if (id === 'emailMagicLinks') {
      tabMethods.add(hasPassword ? PasswordMethods.Email : MagicLinkMethods.Email);
    } else if (id === 'passwords') {
      tabMethods.add(PasswordMethods.Email);
    } else if (id === 'otp') {
      for (const method of otpMethods) {
        tabMethods.add(method === OTPMethods.Email && hasPassword ? PasswordMethods.Email : method);
      }
    }
  }
  return Array.from(tabMethods);
};

export const LoginForm = () => {
  const { t } = useLingui();
  const { otpOptions, products } = useConfig();
  const productsIncludesOtp = hasProduct(products, 'otp');
  const otpMethods = productsIncludesOtp ? (otpOptions?.methods ?? []) : [];
  const hasEmailMagicLink = hasProduct(products, 'emailMagicLinks');
  const hasOTPEmail = productsIncludesOtp && otpMethods.includes(OTPMethods.Email);

  const tabMethods = getTabMethods(products, otpMethods);
  const tabMethodComponents = useProductComponents(products, 'tabs');

  if (hasEmailMagicLink && hasOTPEmail)
    return (
      <Typography variant="helper" color="destructive">
        {DEV('Error: Cannot use both EML and Email OTP')}
      </Typography>
    );

  return (
    <Tabs.Root defaultValue={tabMethods[0]}>
      {tabMethods.length > 1 && (
        <Tabs.List className={styles.tabRow} aria-label={t({ message: 'Select login method', id: 'tab.listLabel' })}>
          {tabMethods.map((method) => (
            <Tabs.Trigger
              value={method}
              key={method}
              className={classNames(buttonClassNames({ variant: 'outline', block: true }), styles.tab)}
            >
              {t(OTPTabHeaders[method])}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      )}

      {tabMethods.map((method) => {
        const Component = tabMethodComponents![method];
        if (tabMethods.length > 1) {
          return (
            // We override tabIndex here because each tab will have some interactive element
            // > It is recommended that all tabpanel elements in a tab set are focusable if there are any panels in
            // > the set that contain content where the first element in the panel is not focusable.
            // - From: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/#accessibilityfeatures
            <Tabs.Content value={method} key={method} tabIndex={-1}>
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
