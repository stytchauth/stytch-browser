import type { Meta, StoryObj } from '@storybook/react-vite';
import { CountryCode, ParsedPhoneNumberResponse } from '@stytch/core';
import React from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import PhoneInput, { PhoneInputProps } from './PhoneInput';

// Mock parsePhoneNumber function for Storybook
const parsePhoneNumber = async (phoneNumber: string): Promise<ParsedPhoneNumberResponse> => {
  // Simulate some delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simple mock logic for demonstration
  if (phoneNumber.length < 10) {
    return {
      isValid: false,
      number: `+1${phoneNumber}`,
      national: phoneNumber,
    };
  }

  // Format as (XXX) XXX-XXXX for US numbers
  const formatted = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  return {
    isValid: true,
    number: `+1${phoneNumber}`,
    national: formatted,
  };
};

const getExampleNumber = async (regionCode: CountryCode) =>
  // Have one region return undefined to test that behavior
  regionCode === 'CA' ? undefined : '(555) 555-5555';

const meta = {
  component: PhoneInput,
  parameters: {
    layout: 'centered',
  },
  args: {
    phone: '',
    setPhone: fn(),
    country: 'US',
    setCountry: fn(),
    parsePhoneNumber,
    getExampleNumber,
  },
  render: function Render() {
    const [{ setPhone, setCountry, ...args }, updateArgs] = useArgs<PhoneInputProps>();
    return (
      <PhoneInput
        {...args}
        setPhone={(phone) => {
          updateArgs({ phone });
          setPhone(phone);
        }}
        setCountry={(country) => {
          updateArgs({ country });
          setCountry(country);
        }}
      />
    );
  },
} satisfies Meta<typeof PhoneInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const WithInitialValue = {
  args: {
    phone: '(555) 555-5555',
  },
} satisfies Story;

export const DifferentCountry = {
  args: {
    country: 'BG',
  },
} satisfies Story;

export const Error = {
  args: {
    error: 'Something went wrong',
  },
} satisfies Story;
