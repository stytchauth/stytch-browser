import { Messages, setupI18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';
import { I18nProvider } from '@lingui/react';
import React, { useEffect, useMemo, useState } from 'react';

export const I18nProviderWrapper = ({
  children,
  messages,
  overrides,
}: {
  children: React.ReactNode;
  messages: Messages;
  overrides?: Record<string, string> | undefined;
}) => {
  const mergedMessages = useMemo(() => {
    return {
      ...messages,
      ...overrides,
    };
  }, [messages, overrides]);

  const [i18n] = useState(() => {
    const instance = setupI18n({
      locale: 'en',
      messages: { en: mergedMessages },
    });

    // We need to support runtime compilation for developer-supplied messages;
    // the following is needed to ensure that works in production builds
    // see: https://lingui.dev/ref/core#i18n.setMessagesCompiler
    instance.setMessagesCompiler(compileMessage);

    return instance;
  });

  useEffect(() => {
    i18n.load({ en: mergedMessages });
  }, [i18n, mergedMessages]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};
