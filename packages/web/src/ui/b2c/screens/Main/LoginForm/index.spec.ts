import { OTPMethods } from '@stytch/core/public';

import * as Products from '../../../Products';
import { MagicLinkMethods, PasswordMethods } from '../../../StytchProduct';
import { getTabMethods } from './index';

describe('getTabMethods', () => {
  it('should return only OTP methods when only OTP product is included', () => {
    const products = [Products.otp];
    const otpMethods = [OTPMethods.SMS, OTPMethods.WhatsApp];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([OTPMethods.SMS, OTPMethods.WhatsApp]);
  });

  it('should include MagicLinkMethods.Email when emailMagicLinks is in products', () => {
    const products = [Products.emailMagicLinks];
    const otpMethods: OTPMethods[] = [];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([MagicLinkMethods.Email]);
  });

  it('should include PasswordMethods.Email when passwords is in products', () => {
    const products = [Products.passwords];
    const otpMethods: OTPMethods[] = [];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([PasswordMethods.Email]);
  });

  it('should filter out MagicLinkMethods.Email when both passwords and emailMagicLinks are included', () => {
    const products = [Products.passwords, Products.emailMagicLinks];
    const otpMethods: OTPMethods[] = [];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([PasswordMethods.Email]);
  });

  it('should filter out OTPMethods.Email when both passwords and OTP Email are included', () => {
    const products = [Products.passwords, Products.otp];
    const otpMethods = [OTPMethods.SMS, OTPMethods.Email];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([PasswordMethods.Email, OTPMethods.SMS]);
  });

  it('should include all applicable methods when multiple products are included', () => {
    const products = [Products.otp, Products.crypto];
    const otpMethods = [OTPMethods.SMS, OTPMethods.WhatsApp, OTPMethods.Email];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([OTPMethods.SMS, OTPMethods.WhatsApp, OTPMethods.Email]);
  });

  it('should handle EML + OTP', () => {
    const products = [Products.emailMagicLinks, Products.otp];
    const otpMethods = [OTPMethods.SMS];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([MagicLinkMethods.Email, OTPMethods.SMS]);
  });

  it('should handle OAuth + OTP', () => {
    const products = [Products.oauth, Products.otp];
    const otpMethods = [OTPMethods.SMS, OTPMethods.WhatsApp];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([OTPMethods.SMS, OTPMethods.WhatsApp]);
  });

  it('should handle EML + OAuth + Crypto', () => {
    const products = [Products.oauth, Products.crypto, Products.emailMagicLinks];
    const otpMethods: OTPMethods[] = [];

    const result = getTabMethods(products, otpMethods);

    expect(result).toEqual([MagicLinkMethods.Email]);
  });
});
