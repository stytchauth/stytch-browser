import { setupI18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';
import { I18nProvider } from '@lingui/react';
import { Decorator } from '@storybook/preact';
import React, { useMemo } from 'react';
import { messages as adminMessagesEn } from '../src/messages/adminPortal/en';
import { messages as b2bMessagesEn } from '../src/messages/b2b/en';
import { messages as b2cMessagesEn } from '../src/messages/en';
import * as pseudo from '../src/messages/pseudo-LOCALE';

const messagesB2C = {
  en: { ...b2cMessagesEn },
  pseudo: { ...pseudo.messages },
  custom: {
    ...b2cMessagesEn,
    'loginPage.title': 'Custom title',
  },
};

const messagesB2B = {
  en: { ...b2bMessagesEn },
  pseudo: { ...pseudo.b2bMessages },
  custom: {
    ...b2bMessagesEn,
    'organizationLogin.title': 'Proceed to your {organizationName} account',
  },
};

const messagesAdmin = {
  en: { ...adminMessagesEn },
  pseudo: { ...pseudo.adminPortalMessages },
  custom: {
    ...adminMessagesEn,
  },
};

const messagesCombined = {
  en: { ...messagesB2B.en, ...messagesAdmin.en, ...messagesB2C.en },
  pseudo: { ...messagesB2B.pseudo, ...messagesAdmin.pseudo, ...messagesB2C.pseudo },
  custom: {
    ...messagesB2B.custom,
    ...messagesAdmin.custom,
    ...messagesB2C.custom,
  },
};

// Capitalized to trick React lint rules into thinking this is a component
export const I18nDecorator: Decorator = (storyFn, context) => {
  const { locale } = context.globals;

  const messages = useMemo(() => {
    const title = context.title.toLowerCase();
    if (title.startsWith('b2b/')) {
      return messagesB2B;
    }
    if (title.startsWith('b2c/')) {
      return messagesB2C;
    }
    if (title.startsWith('admin portal/')) {
      return messagesAdmin;
    }
    return messagesCombined;
  }, [context.title]);

  const i18n = useMemo(() => {
    const instance = setupI18n({
      locale,
      messages,
      missing: (locale, id) => (locale === 'id' ? id : `🚨MISSING🚨 ${id}`),
    });

    // We need to support runtime compilation for developer-supplied messages;
    // the following is needed to ensure that works in production builds
    // see: https://lingui.dev/ref/core#i18n.setMessagesCompiler
    instance.setMessagesCompiler(compileMessage);

    return instance;
  }, [locale, messages]);

  return <I18nProvider i18n={i18n}>{storyFn() as React.ReactNode}</I18nProvider>;
};
