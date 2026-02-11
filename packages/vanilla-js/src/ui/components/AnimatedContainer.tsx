import React from 'react';
import styled from 'styled-components';

// Inspired by
// https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/#with-grid
const Wrapper = styled.div<{ isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ isOpen }) => (isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.15s ease-out;
`;

const Inner = styled.div`
  overflow: hidden;
`;

export const AnimatedContainer = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  return (
    <Wrapper isOpen={isOpen}>
      <Inner>{children}</Inner>
    </Wrapper>
  );
};
