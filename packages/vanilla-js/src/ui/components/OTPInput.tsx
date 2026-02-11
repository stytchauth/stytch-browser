import React, { useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react/macro';
import styled from 'styled-components';
import { passwordManagerDisableAutofillProps } from '../../utils/passwordManagerDisableAutofillProps';

const OTP_LENGTH = 6;

const GAP = '8px';
const WIDTH = '46px';
const INPUT_HEIGHT = '46px';

const Digit = styled.div<{ disabled: boolean }>`
  border: 1px solid ${({ disabled, theme }) => (disabled ? theme.colors.disabled : '#ADBCC5')};
  border-radius: 4px;
  align-items: center;
  display: flex;
  font-size: 18px;
  justify-content: center;
  height: ${INPUT_HEIGHT};
  width: ${WIDTH};
  background: ${({ disabled, theme }) => (disabled ? theme.colors.disabled : theme.inputs.backgroundColor)};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.disabledText : theme.inputs.textColor)};
`;

const digitsContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: GAP,
  position: 'relative',
  zIndex: -1,
};

const otpContainerStyles: React.CSSProperties = {
  overflow: 'hidden',
  position: 'relative',
  textAlign: 'initial',
  zIndex: 1,
};

const invisibleInputStyles: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'transparent',
  height: INPUT_HEIGHT,
  margin: 0,
  outline: 'none',
  position: 'absolute',
  width: `calc(100% - (0.5 * ${WIDTH}))`,
  caretColor: '#ADBCC5',
  letterSpacing: `calc(${WIDTH} - 1ch + ${GAP})`,
  paddingLeft: `calc(0.5 * ${WIDTH})`,
  zIndex: 10,
};

const DigitAtIndex = ({ index, disabled, otp }: { index: number; disabled: boolean; otp: string }): JSX.Element => {
  const fill = otp ? otp[index] : '';
  return (
    <Digit disabled={disabled} data-testid={`otp-${index}`}>
      {fill}
    </Digit>
  );
};

export const OTPInput = ({
  otp,
  setOtp,
  disabled,
}: {
  otp: string;
  setOtp: (otp: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useLingui();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) {
      ref.current?.focus();
    }
  }, [disabled, ref]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>): void => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    target.value = newValue;
    if (newValue !== otp) {
      setOtp(newValue);
    }
  };

  return (
    <div style={otpContainerStyles}>
      <input
        ref={ref}
        aria-label={t({ id: 'formField.otp.ariaLabel', message: 'One-time passcode' })}
        autoComplete="one-time-code"
        autoFocus
        disabled={disabled}
        style={invisibleInputStyles}
        onInput={handleInput}
        type="text"
        inputMode="numeric"
        value={otp}
        {...passwordManagerDisableAutofillProps} // We never want 1PW to interact with this
      />
      <div style={digitsContainerStyles}>
        {[...Array(OTP_LENGTH).keys()].map((i) => {
          return <DigitAtIndex key={`digit-${i}`} index={i} otp={otp} disabled={!!disabled} />;
        })}
      </div>
    </div>
  );
};
