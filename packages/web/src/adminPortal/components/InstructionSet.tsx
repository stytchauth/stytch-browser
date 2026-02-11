import React from 'react';

import { FlexBox } from './FlexBox';

interface InstructionSetProps {
  children: React.ReactNode;
}

export const InstructionSet = ({ children }: InstructionSetProps) => (
  <FlexBox flexDirection="column" gap={2}>
    {children}
  </FlexBox>
);
