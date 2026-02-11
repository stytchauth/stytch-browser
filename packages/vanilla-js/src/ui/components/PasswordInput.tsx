import React, { useState } from 'react';
import styled from 'styled-components';
import { Flex } from './Flex';
import { PasswordIconSvg, PasswordIconVisibleSvg } from '../../assets/passwordIcon';
import { InputLabelProps } from '../../utils/accessibility';
import { BaseButton } from './BaseButton';
import { useLingui } from '@lingui/react/macro';

const BaseInput = styled.input`
  border: 0;
  padding: 0;
  width: 100%;

  background-color: transparent;
  height: 45px;
  color: ${(props) => props.theme.inputs.textColor};
  font-family: ${(props) => props.theme.typography.fontFamily};
  font-size: 18px;

  &::placeholder {
    color: ${(props) => props.theme.inputs.placeholderColor};
  }

  &:disabled {
    color: ${(props) => props.theme.colors.disabledText};
    background-color: ${(props) => props.theme.colors.disabled};
  }

  &:focus {
    outline: none;
  }
`;

const InputContainer = styled(Flex)`
  background-color: ${(props) => props.theme.inputs.backgroundColor};
  height: 45px;
  padding-left: 8px;
  padding-right: 8px;
  border: 1px solid ${(props) => props.theme.inputs.borderColor};
  border-radius: ${(props) => props.theme.inputs.borderRadius};
  color: ${(props) => props.theme.inputs.textColor};
  font-family: ${(props) => props.theme.typography.fontFamily};
  font-size: 18px;
  width: calc(100% - 18px);

  &:focus-within {
    outline: 1px auto;
  }
`;

const PasswordIconButton = styled(BaseButton)<{ passwordEntered: boolean }>`
  height: 20px;
  color: ${(props) => (props.passwordEntered ? props.theme.inputs.textColor : props.theme.colors.disabledText)};

  &:disabled {
    cursor: default;
  }
`;

const PasswordIcon = ({
  onClick,
  passwordEntered,
  visible,
}: {
  onClick?: () => void;
  passwordEntered: boolean;
  visible: boolean;
}) => {
  const { t } = useLingui();

  return (
    <PasswordIconButton
      onClick={onClick}
      type="button"
      passwordEntered={passwordEntered}
      aria-label={
        visible
          ? t({ id: 'button.hidePassword', message: 'Hide password' })
          : t({ id: 'button.showPassword', message: 'Show password' })
      }
    >
      {visible ? <PasswordIconVisibleSvg /> : <PasswordIconSvg />}
    </PasswordIconButton>
  );
};

export const PasswordInput = ({
  password,
  setPassword,
  type,
  ...additionalProps
}: {
  password: string;
  setPassword: (email: string) => void;
  type: 'new' | 'current';
} & InputLabelProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <InputContainer gap={2} alignItems="center">
      <BaseInput
        name="password"
        id={`${type}-password`}
        autoComplete={`${type}-password`}
        type={visible ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        {...additionalProps}
      />
      <PasswordIcon onClick={() => setVisible((visible) => !visible)} passwordEntered={!!password} visible={visible} />
    </InputContainer>
  );
};
