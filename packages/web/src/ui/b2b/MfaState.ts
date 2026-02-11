import { CountryCode } from '@stytch/core';
import { B2BMFAProducts } from '@stytch/core/public';

import { AppScreens } from './types/AppScreens';

export interface MfaState {
  primaryInfo: {
    enrolledMfaMethods: B2BMFAProducts[];
    memberId: string;
    memberPhoneNumber: string | null;
    organizationId: string;
    organizationMfaOptionsSupported: B2BMFAProducts[];
    postAuthScreen: AppScreens;
  } | null;
  isEnrolling: boolean;
  smsOtp: {
    isSending: boolean;
    sendError: unknown;
    codeExpiration: Date | null;
    formattedDestination: string | null;
    enrolledNumber: {
      phoneNumber: string;
      countryCode: CountryCode;
    } | null;
  };
  totp: {
    isCreating: boolean;
    createError: unknown;
    enrollment: {
      secret: string;
      qrCode: string;
      recoveryCodes: string[];
      method: 'qr' | 'manual';
    } | null;
  };
}

export const DEFAULT_MFA_STATE = {
  primaryInfo: null,
  isEnrolling: false,
  smsOtp: {
    isSending: false,
    sendError: null,
    codeExpiration: null,
    formattedDestination: null,
    enrolledNumber: null,
  },
  totp: {
    isCreating: false,
    createError: null,
    enrollment: null,
  },
} as const satisfies MfaState;
