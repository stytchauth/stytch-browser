import React from 'react';
import { StyledComponentProps } from '../../utils/StyledComponentProps';
import Button from './Button';
import { CircularProgress } from './CircularProgress';
import { Flex } from './Flex';

interface LoadingButtonProps extends StyledComponentProps<typeof Button> {
  isLoading: boolean;
}

export const LoadingButton = ({ children, isLoading, ...buttonProps }: LoadingButtonProps) => (
  <Button {...buttonProps}>
    {isLoading ? (
      <Flex justifyContent="center">
        <CircularProgress size={18} thickness={1} data-testid="loading-icon" />
      </Flex>
    ) : (
      children
    )}
  </Button>
);
