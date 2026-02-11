import styled from 'styled-components';
import { focusedRing } from '../../utils/accessibility';

export const BaseButton = styled.button`
  all: unset;

  cursor: pointer;
  font-family: ${(props) => props.theme.typography.fontFamily};

  &:focus-visible {
    ${focusedRing}
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
