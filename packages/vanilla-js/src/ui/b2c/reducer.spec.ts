import { Action, reducer } from './reducer';
import { AppScreens, CryptoState, DEFAULT_STATE, OTPState } from './GlobalContextProvider';
import { OTPMethods, Wallets } from '@stytch/core/public';

describe('reducer', () => {
  it('should transition to the screen defined in the action', () => {
    const initialState = DEFAULT_STATE;
    const action: Action = {
      type: 'transition',
      screen: AppScreens.CryptoSetupWallet,
    };

    const resultFromAction = reducer(initialState, action);
    expect(resultFromAction.screen).toEqual(AppScreens.CryptoSetupWallet);
  });

  it('should set the email for the magic link form state', () => {
    const initialState = DEFAULT_STATE;
    const emailForAction = 'hello@stytch.com';
    const action: Action = {
      type: 'set_magic_link_email',
      email: emailForAction,
    };

    const resultFromAction = reducer(initialState, action);
    expect(resultFromAction.formState.magicLinkState.email).toEqual(emailForAction);
  });

  it('should update the otp state', () => {
    const initialState = DEFAULT_STATE;
    const otpState: OTPState = {
      methodId: 'method-12345',
      type: OTPMethods.Email,
      otpDestination: 'hello@stytch.com',
    };
    const action: Action = {
      type: 'update_otp_state',
      otpState,
    };

    const resultFromAction = reducer(initialState, action);
    expect(resultFromAction.formState.otpState).toEqual(otpState);
  });

  it('should update the crypto state', () => {
    const initialState = DEFAULT_STATE;
    const cryptoState: CryptoState = {
      walletAddress: '0x',
      walletChallenge: 'challenge-12345',
      walletOption: Wallets.Metamask,
    };
    const action: Action = {
      type: 'update_crypto_state',
      cryptoState,
    };

    const resultFromAction = reducer(initialState, action);
    expect(resultFromAction.formState.cryptoState).toEqual(cryptoState);
  });
});
