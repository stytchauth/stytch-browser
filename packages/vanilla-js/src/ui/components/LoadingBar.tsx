import React from 'react';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  height: 4px;
  background-color: ${({ theme }) => theme.colors.disabled};
  border-radius: 3px;
  overflow: hidden;
`;

const loading = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(-1%);
  }
`;

const Progress = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  animation: ${loading} 10s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const LoadingBar = ({ isLoading }: { isLoading: boolean }) => {
  return <Container>{isLoading && <Progress />}</Container>;
};
