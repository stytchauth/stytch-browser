import { B2BMFAProducts } from '@stytch/core/public';

import * as ContextProvider from '../ContextProvider';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { useGetMemberPhoneNumber } from './useGetMemberPhoneNumber';

describe('useGetMemberPhoneNumber', () => {
  describe('getParsedNumber', () => {
    it('uses memberPhoneNumber if it is present', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            mfaState: {
              ...DEFAULT_UI_STATE.mfaState,
              primaryInfo: {
                enrolledMfaMethods: [B2BMFAProducts.smsOtp],
                memberId: 'member-id',
                memberPhoneNumber: '+15005550006',
                organizationId: 'organization-id',
                organizationMfaOptionsSupported: [B2BMFAProducts.smsOtp],
                postAuthScreen: Screen.Success,
              },
            },
          },
          jest.fn(),
        ];
      });
      const { getParsedNumber } = useGetMemberPhoneNumber();
      const number = getParsedNumber();
      expect(number).toEqual({ country: 'US', phone: '5005550006' });
    });
    it('uses enrolledNumber if it is present with a valid country code and phone number', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            mfaState: {
              ...DEFAULT_UI_STATE.mfaState,
              primaryInfo: null,
              smsOtp: {
                ...DEFAULT_UI_STATE.mfaState.smsOtp,
                enrolledNumber: {
                  countryCode: '+1',
                  phoneNumber: '5005550007',
                },
              },
            },
          },
          jest.fn(),
        ];
      });
      const { getParsedNumber } = useGetMemberPhoneNumber();
      const number = getParsedNumber();
      expect(number).toEqual({ country: 'US', phone: '5005550007' });
    });
    it('uses enrolledNumber and accounts for phoneNumbers with errant country codes added', () => {
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            mfaState: {
              ...DEFAULT_UI_STATE.mfaState,
              primaryInfo: null,
              smsOtp: {
                ...DEFAULT_UI_STATE.mfaState.smsOtp,
                enrolledNumber: {
                  countryCode: '+1',
                  phoneNumber: '+15005550008',
                },
              },
            },
          },
          jest.fn(),
        ];
      });
      const { getParsedNumber } = useGetMemberPhoneNumber();
      const number = getParsedNumber();
      expect(number).toEqual({ country: 'US', phone: '5005550008' });
    });
  });
});
