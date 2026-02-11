import { useLingui } from '@lingui/react/macro';
import classNames from 'classnames';
import { OTPInput, RenderProps } from 'input-otp';
import React, { useMemo, useState } from 'react';

import styles from './OtpInput.module.css';

const OTP_LENGTH = 6;

export type OtpInputProps = {
  onSubmit: (otp: string) => void;
  defaultOtp?: string;
  disabled?: boolean;
};

const transformInput = (input: string) => input.replace(/\D/g, '').slice(0, OTP_LENGTH);

const renderSlots = ({ slots }: RenderProps) => (
  <div className={styles.slotsContainer}>
    {slots.map((slot, index) => (
      <div
        key={index}
        className={classNames(styles.otpSlot, {
          [styles.active]: slot.isActive,
        })}
      >
        <span>{slot.char}</span>
        {slot.hasFakeCaret && <div className={styles.caret} />}
      </div>
    ))}
  </div>
);

const OtpInput = ({ defaultOtp, onSubmit, disabled, ...additionalProps }: OtpInputProps) => {
  const { t } = useLingui();
  const [otp, setOtp] = useState(defaultOtp);

  const isSafari = useMemo(() => {
    const ua = navigator.userAgent.toLowerCase();
    // chrom catches both chrome and chromium
    return ua.includes('safari') && !ua.includes('chrom');
  }, []);

  return (
    <OTPInput
      aria-label={t({ id: 'formField.otp.ariaLabel', message: 'One-time passcode' })}
      containerClassName={classNames(styles.inputContainer, {
        [styles.disabled]: disabled,
        [styles.safari]: isSafari,
      })}
      maxLength={OTP_LENGTH}
      value={otp}
      onChange={(newOtp) => setOtp(transformInput(newOtp))}
      pasteTransformer={transformInput}
      disabled={disabled}
      onComplete={onSubmit}
      pattern="[0-9]*"
      render={renderSlots}
      {...additionalProps}
    />
  );
};

export default OtpInput;
