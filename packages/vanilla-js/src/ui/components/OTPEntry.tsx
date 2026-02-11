import React from 'react';
import { Flex } from './Flex';
import { Text } from './Text';
import { OTPControl } from './OTPControl';

interface OTPEntryProps {
  header: React.ReactNode;
  instruction: React.ReactNode;
  helperContent: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
  errorMessage?: string;
}

export const OTPEntry = ({
  header,
  helperContent,
  instruction,
  isSubmitting,
  onSubmit,
  errorMessage,
}: OTPEntryProps) => {
  return (
    <Flex direction="column" gap={24}>
      <Text size="header">{header}</Text>
      <Text>{instruction}</Text>
      <OTPControl isSubmitting={isSubmitting} onSubmit={onSubmit} errorMessage={errorMessage} />
      <Text size="helper" color="secondary">
        {helperContent}
      </Text>
    </Flex>
  );
};
