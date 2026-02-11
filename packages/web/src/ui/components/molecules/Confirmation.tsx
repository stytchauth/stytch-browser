import { useLingui } from '@lingui/react/macro';
import * as React from 'react';

import TextColumn from './TextColumn';

type ConfirmationProps = {
  header?: string;
  text?: string;
};

export const Confirmation = ({ header, text }: ConfirmationProps) => {
  const { t } = useLingui();
  const defaultHeader = t({ id: 'success.title', message: 'Success!' });
  const defaultText = t({ id: 'login.success.content', message: 'You have successfully logged in.' });

  return <TextColumn header={header ?? defaultHeader} body={text ?? defaultText} align="center" />;
};
