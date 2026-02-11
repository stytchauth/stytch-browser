import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useUpdateMemberPhoneNumber } from './updateMemberPhoneNumber';

describe('UpdateMemberPhoneNumber', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
  });
  it('dispatches the expected action', () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setMemberPhoneNumber } = useUpdateMemberPhoneNumber();
    setMemberPhoneNumber('+1', '1234567890');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'member/phoneNumber',
      countryCode: '+1',
      phoneNumber: '1234567890',
    });
  });
});
