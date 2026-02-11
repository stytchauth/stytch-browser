import React, { createRef, useCallback, useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { FormFieldError } from '../../b2c/components/FormFieldError';
import { StytchInput } from '../../b2c/components/StytchInput';

const CODE_LENGTH = 6;

interface OTPInputProps {
  onCodeComplete: (code: string) => Promise<void>;
  testID?: string;
}

export const OTPInput = ({ onCodeComplete, testID = 'OTPInput' }: OTPInputProps) => {
  const [numbers, setNumbers] = useState(() => ['', '', '', '', '', '']);
  const [inputRefsArray] = useState(() => Array.from({ length: CODE_LENGTH }, () => createRef<TextInput>()));
  const [codeIsInvalid, setCodeIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyFocusToRef = useCallback(
    (index: number) => {
      setTimeout(() => {
        inputRefsArray[index]?.current?.focus();
      }, 0);
    },
    [inputRefsArray],
  );

  useEffect(() => applyFocusToRef(0), [applyFocusToRef]);

  useEffect(() => {
    if (codeIsInvalid) {
      inputRefsArray.forEach((ref) => {
        ref.current?.clear();
      });
      setNumbers(['', '', '', '', '', '']);
      applyFocusToRef(0);
    }
  }, [codeIsInvalid, inputRefsArray, applyFocusToRef]);

  useEffect(() => {
    if (isSubmitting) return;
    if (numbers.length === CODE_LENGTH && numbers.every((value) => value !== '')) {
      setCodeIsInvalid(false);
      setIsSubmitting(true);
      onCodeComplete(numbers.join('')).catch(() => {
        setCodeIsInvalid(true);
        setIsSubmitting(false);
      });
    }
  }, [isSubmitting, numbers, onCodeComplete]);

  const handleChangeText = useCallback(
    (code: string, index: number) => {
      if (code.length > 1) {
        const newNumbers = code.split('');
        setNumbers(newNumbers);
        applyFocusToRef(CODE_LENGTH - 1);
        return;
      }
      const newNumbers = [...numbers];
      newNumbers[index] = code;
      setNumbers(newNumbers);
      if (code !== '' && index < numbers.length) {
        applyFocusToRef(index + 1);
      }
    },
    [numbers, applyFocusToRef],
  );

  const handleKeyPress = useCallback(
    (keyValue: string, index: number) => {
      if (keyValue === 'Backspace') {
        const newNumbers = [...numbers];
        let clearAndSetFocusTo = index;
        if (newNumbers[index] === '') {
          // did we press backspace on an empty input? then pop back to the previous one and delete _that_
          clearAndSetFocusTo = Math.max(0, index - 1);
        }
        newNumbers[clearAndSetFocusTo] = '';
        setNumbers(newNumbers);
        applyFocusToRef(clearAndSetFocusTo);
      }
    },
    [numbers, applyFocusToRef],
  );

  return (
    <View testID={testID}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {inputRefsArray.map((ref, index) => (
          <StytchInput
            reference={ref}
            key={index}
            keyboardType="numeric"
            width={48}
            height={48}
            padding={0}
            editable={true}
            onChangeText={(code) => handleChangeText(code, index)}
            value={numbers[index]}
            onFocus={() => applyFocusToRef(index)}
            maxLength={index === 0 ? CODE_LENGTH : 1}
            textAlign="center"
            autoFocus={index === 0}
            textContentType="oneTimeCode"
            onKeyPress={({ nativeEvent: { key: keyValue } }) => handleKeyPress(keyValue, index)}
          />
        ))}
      </View>
      {codeIsInvalid && <FormFieldError text="Invalid passcode, please try again." />}
    </View>
  );
};
