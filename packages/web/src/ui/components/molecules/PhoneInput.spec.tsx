import { ParsedPhoneNumberResponse } from '@stytch/core';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { act, createResolvablePromise, render, screen } from '../../../testUtils';
import PhoneInput from './PhoneInput';

const MOCK_PARSED_PHONE_NUMBER = {
  isValid: true,
  number: '+14084059221',
  national: '(408) 405-9221',
};

describe('Phone Number Input', () => {
  const getExampleNumber = jest.fn().mockReturnValueOnce({ phoneNumber: '(555) 555-5555' });

  it('typing in phone number calls setPhone with correctly formatted number', async () => {
    const mockSetPhone = jest.fn();
    const mockSetCountry = jest.fn();
    const parsePhoneNumber = jest.fn().mockResolvedValue(MOCK_PARSED_PHONE_NUMBER);

    render(
      <PhoneInput
        phone=""
        setPhone={mockSetPhone}
        country="US"
        setCountry={mockSetCountry}
        parsePhoneNumber={parsePhoneNumber}
        getExampleNumber={getExampleNumber}
      />,
    );
    const el = screen.getByLabelText('Phone number');
    await userEvent.type(el, '4084059221');
    expect(mockSetPhone).toHaveBeenCalledWith('(408) 405-9221');
  });

  it('does not replace user input with stale formatted number', async () => {
    const mockSetPhone = jest.fn();
    const mockSetCountry = jest.fn();
    const parseResponses: { phoneNumber: string; resolve: (value: ParsedPhoneNumberResponse) => void }[] = [];
    const parsePhoneNumber = jest.fn((phoneNumber: string) => {
      const { promise, resolve } = createResolvablePromise<ParsedPhoneNumberResponse>();
      parseResponses.push({ phoneNumber, resolve });
      return promise;
    });
    render(
      <PhoneInput
        phone={'1234'}
        setPhone={mockSetPhone}
        country={'US'}
        setCountry={mockSetCountry}
        parsePhoneNumber={parsePhoneNumber}
        getExampleNumber={getExampleNumber}
      />,
    );
    const el = screen.getByLabelText('Phone number');
    await userEvent.type(el, '5');
    await userEvent.type(el, '6');

    let nextResponse = parseResponses.shift()!;
    expect(nextResponse.phoneNumber).toBe('12345');
    await act(() => nextResponse.resolve({ isValid: false, number: '+112345', national: '123-45' }));

    expect(mockSetPhone).not.toHaveBeenCalled();

    await userEvent.type(el, '7');

    nextResponse = parseResponses.shift()!;
    expect(nextResponse.phoneNumber).toBe('123456');
    await act(() => nextResponse.resolve({ isValid: false, number: '+1123456', national: '123-456' }));

    expect(mockSetPhone).not.toHaveBeenCalled();
    nextResponse = parseResponses.shift()!;
    expect(nextResponse.phoneNumber).toBe('1234567');
    await act(() => nextResponse.resolve({ isValid: true, number: '+11234567', national: '123-4567' }));

    // process.nextTick is required here because we are mocking parsePhoneNumber rather than formatNumber
    await new Promise(process.nextTick);
    expect(mockSetPhone).toHaveBeenCalledTimes(1);
    expect(mockSetPhone).toHaveBeenCalledWith('123-4567');
  });
});
