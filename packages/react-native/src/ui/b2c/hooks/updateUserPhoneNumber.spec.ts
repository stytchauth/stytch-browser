import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { useUpdateUserPhoneNumber } from './updateUserPhoneNumber';

describe('updateUserPhoneNumber', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
  });
  it('dispatches the expected action', () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setUserPhoneNumber } = useUpdateUserPhoneNumber();
    setUserPhoneNumber('+1', '1234567890', '+1 123-456-7890');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'updateState/user/phoneNumber',
      countryCode: '+1',
      phoneNumber: '1234567890',
      formattedPhoneNumber: '+1 123-456-7890',
    });
  });
});
