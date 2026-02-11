import { formatNumber, formatNumberToIncludeCountryCode } from './handleParsePhoneNumber';
import { COUNTRIES_LIST } from '@stytch/core';

describe('formatNumber', () => {
  const mockParsePhoneNumber = jest.fn();

  it('should return parsed phone number when valid', async () => {
    const parsedPhoneNumber = {
      national: '(123) 456-7890',
    };

    mockParsePhoneNumber.mockResolvedValue(parsedPhoneNumber);

    const result = await formatNumber({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
      country: 'US',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', 'US');
    expect(result).toEqual(parsedPhoneNumber.national);
  });

  it('should return fallback when an error occurs', async () => {
    mockParsePhoneNumber.mockRejectedValue(new Error('Parsing error'));

    const result = await formatNumber({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
      country: 'US',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', 'US');
    expect(result).toEqual('1234567890');
  });

  it('should return parsed phone number when no country code is provided', async () => {
    const parsedPhoneNumber = {
      national: '(123) 456-7890',
    };

    mockParsePhoneNumber.mockResolvedValue(parsedPhoneNumber);

    const result = await formatNumber({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', undefined);
    expect(result).toEqual(parsedPhoneNumber.national);
  });

  it('should return fallback when an error occurs and no country code is provided', async () => {
    mockParsePhoneNumber.mockRejectedValue(new Error('Parsing error'));

    const result = await formatNumber({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', undefined);
    expect(result).toEqual('1234567890');
  });
});

describe('formatNumberToIncludeCountryCode', () => {
  const mockParsePhoneNumber = jest.fn();

  it('should return parsed phone number when valid', async () => {
    const parsedPhoneNumber = {
      isValid: true,
      number: '+11234567890',
      national: '(123) 456-7890',
    };

    mockParsePhoneNumber.mockResolvedValue(parsedPhoneNumber);

    const result = await formatNumberToIncludeCountryCode({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
      country: 'US',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', 'US');
    expect(result).toEqual(parsedPhoneNumber);
  });

  it('should return fallback when an error occurs', async () => {
    mockParsePhoneNumber.mockRejectedValue(new Error('Parsing error'));

    const result = await formatNumberToIncludeCountryCode({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '1234567890',
      country: 'US',
    });

    const countryCode = COUNTRIES_LIST['US'];
    expect(mockParsePhoneNumber).toHaveBeenCalledWith('1234567890', 'US');
    expect(result).toEqual({
      isValid: true,
      number: `+${countryCode}1234567890`,
    });
  });

  it('should return the provided phone number if number already contains the country code', async () => {
    const parsedPhoneNumber = {
      isValid: true,
      number: '+11234567890',
      national: '(123) 456-7890',
    };

    mockParsePhoneNumber.mockResolvedValue(parsedPhoneNumber);

    const result = await formatNumberToIncludeCountryCode({
      parsePhoneNumber: mockParsePhoneNumber,
      phoneNumber: '+11234567890',
      country: 'US',
    });

    expect(mockParsePhoneNumber).toHaveBeenCalledWith('+11234567890', 'US');
    expect(result).toEqual(parsedPhoneNumber);
  });
});
