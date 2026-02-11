import React from 'react';
import styled from 'styled-components';
import { Flex } from './Flex';

const Block = styled.div<{ $bgColor: string }>`
  height: 4px;
  width: 25%;
  background-color: ${(props) => props.$bgColor};
`;

export const PasswordStrengthCheck = ({ score }: { score?: number }) => {
  let blocks: string[] = [];
  switch (score) {
    case 0:
    case 1:
      blocks = ['#8B1214', '#ADBCC5', '#ADBCC5', '#ADBCC5'];
      break;
    case 2:
      blocks = ['#8B1214', '#8B1214', '#ADBCC5', '#ADBCC5'];
      break;
    case 3:
      blocks = ['#0C5A56', '#0C5A56', '#0C5A56', '#ADBCC5'];
      break;
    case 4:
      blocks = ['#0C5A56', '#0C5A56', '#0C5A56', '#0C5A56'];
      break;
    default:
      blocks = ['#ADBCC5', '#ADBCC5', '#ADBCC5', '#ADBCC5'];
      break;
  }

  return (
    <Flex gap={2}>
      {blocks.map((block, i) => (
        <Block key={`${block}-${i}`} $bgColor={block} />
      ))}
    </Flex>
  );
};
