import { AuthFlowType } from '@stytch/core/public';

import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { B2BErrorType } from '../../shared/types';
import { B2BUpdateDiscoveryStateAction } from '../actions';
import {
  MOCK_DISCOVERED_ORGANIZATION,
  MOCK_DISCOVERED_ORGANIZATION_NO_PRIMARY_AUTH,
  MOCK_FULLY_AUTHED_MEMBER_SESSION,
} from '../mocks';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE, DiscoveryState } from '../states';
import { UpdateDiscoveryStateReducer } from './UpdateDiscoveryStateReducer';

describe('UpdateDiscoveryStateReducer', () => {
  it('discovery/setDiscoveredOrganizations sets expected state', () => {
    const action: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/setDiscoveredOrganizations',
      email: 'test@stytch.com',
      discoveredOrganizations: [MOCK_DISCOVERED_ORGANIZATION],
    };
    const expected: DiscoveryState = {
      email: action.email,
      discoveredOrganizations: action.discoveredOrganizations,
    };
    const result = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, action);
    expect(result.discoveryState).toEqual(expected);
    expect(result.screen).toEqual(Screen.Discovery);
  });
  it('discovery/selectDiscoveredOrganization expected state', () => {
    const memberAction: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/selectDiscoveredOrganization',
      organization: MOCK_DISCOVERED_ORGANIZATION,
    };
    const memberResult = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, memberAction);
    expect(memberResult.authenticationState.authFlowType).toEqual(AuthFlowType.Organization);
    expect(memberResult.authenticationState.organization).toEqual(memberAction.organization.organization);
    expect(memberResult.primaryAuthState.primaryAuthMethods).toEqual(
      MOCK_DISCOVERED_ORGANIZATION.primary_required?.allowed_auth_methods,
    );
    expect(memberResult.screen).toEqual(Screen.Main);

    const noPrimaryAuthAction: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/selectDiscoveredOrganization',
      organization: MOCK_DISCOVERED_ORGANIZATION_NO_PRIMARY_AUTH,
    };
    const noPrimaryAuthResult = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, noPrimaryAuthAction);
    expect(noPrimaryAuthResult.screen).toEqual(Screen.Error);
    expect(noPrimaryAuthResult.screenState.error?.internalError).toEqual(B2BErrorType.CannotJoinOrgDueToAuthPolicy);
  });
  it('discovery/intermediateSessions/exchange/success sets expected state', () => {
    const action: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/intermediateSessions/exchange/success',
      response: MOCK_FULLY_AUTHED_MEMBER_SESSION,
    };
    const result = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('discovery/organizations/create/success sets expected state', () => {
    const action: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/organizations/create/success',
      response: MOCK_FULLY_AUTHED_MEMBER_SESSION,
    };
    const result = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('discovery/intermediateSessions/exchange/error sets expected state', () => {
    const action: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/intermediateSessions/exchange/error',
      error: MOCK_ERROR_RESPONSE,
    };
    const result = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.Error,
    });
  });
  it('discovery/organizations/create/error sets expected state', () => {
    const action: B2BUpdateDiscoveryStateAction = {
      type: 'discovery/organizations/create/error',
      error: MOCK_ERROR_RESPONSE,
    };
    const result = UpdateDiscoveryStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.Error,
    });
  });
});
