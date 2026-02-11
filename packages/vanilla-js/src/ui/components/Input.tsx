import styled from 'styled-components';

export const Input = styled.input`
  background-color: ${(props) => props.theme.inputs.backgroundColor};
  height: 47px;
  padding: 0 8px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.inputs.borderColor};
  border-radius: ${(props) => props.theme.inputs.borderRadius};
  color: ${(props) => props.theme.inputs.textColor};
  font-family: ${(props) => props.theme.typography.fontFamily};
  font-size: 18px;

  &::placeholder {
    color: ${(props) => props.theme.inputs.placeholderColor};
  }

  &:disabled {
    border: 1px solid ${(props) => props.theme.colors.disabledText};
    color: ${(props) => props.theme.colors.disabledText};
    background-color: ${(props) => props.theme.colors.disabled};
  }
`;
