import React from 'react';
import { CopyableText } from './CopyableText';
import { Instruction } from './Instruction';
import { SettingsListItem } from './SettingsListItem';

export const IdpField = ({ title, value, isCopyable }: { title: string; value: string; isCopyable?: boolean }) => (
  <SettingsListItem title={title}>
    {isCopyable ? <CopyableText>{value}</CopyableText> : <Instruction>{value}</Instruction>}
  </SettingsListItem>
);
