import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useUpdateMemberPassword } from './updateMemberPassword';

describe('UpdateMemberPassword', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
  });
  it('dispatches the expected action', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setMemberPassword } = useUpdateMemberPassword();
    setMemberPassword('my cool password');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'member/password', password: 'my cool password' });
  });
});
