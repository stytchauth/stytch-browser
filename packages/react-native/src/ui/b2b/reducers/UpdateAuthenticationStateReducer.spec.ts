import { AuthFlowType } from '@stytch/core/public';

import { B2BUpdateAuthenticationStateAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { UpdateAuthenticationStateReducer } from './UpdateAuthenticationStateReducer';

describe('UpdateAuthenticationStateReducer', () => {
  it('authentication/methodId sets expected state', () => {
    const action: B2BUpdateAuthenticationStateAction = { type: 'authentication/methodId', methodId: 'method-id' };
    const result = UpdateAuthenticationStateReducer(DEFAULT_UI_STATE, action);
    expect(result.authenticationState.methodId).toEqual('method-id');
  });
  it('authentication/token sets expected state', () => {
    const action: B2BUpdateAuthenticationStateAction = { type: 'authentication/token', token: 'token' };
    const result = UpdateAuthenticationStateReducer(DEFAULT_UI_STATE, action);
    expect(result.authenticationState.token).toEqual('token');
  });
  it('authentication/flowType sets expected state', () => {
    const action: B2BUpdateAuthenticationStateAction = {
      type: 'authentication/flowType',
      authFlowType: AuthFlowType.Discovery,
    };
    const result = UpdateAuthenticationStateReducer(DEFAULT_UI_STATE, action);
    expect(result.authenticationState.authFlowType).toEqual(AuthFlowType.Discovery);
  });
});
