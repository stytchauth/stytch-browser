import styled from 'styled-components';

export const Label = styled.label`
  all: unset;
  display: block;
  cursor: default;
  width: fit-content;

  color: ${(props) => props.theme.colors.secondary};
  ${(props) => props.theme.typography.helper};
`;
