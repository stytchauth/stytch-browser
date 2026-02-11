import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useUpdateMemberEmailAddress } from './updateMemberEmailAddress';

describe('UpdateMemberEmailAddress', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
  });
  it('dispatches the expected action for good emails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setMemberEmailAddress } = useUpdateMemberEmailAddress();
    setMemberEmailAddress('my@email.com');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'member/emailAddress',
      emailAddress: 'my@email.com',
      isValid: true,
    });
  });
  it('dispatches the expected action for bad emails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setMemberEmailAddress } = useUpdateMemberEmailAddress();
    setMemberEmailAddress('test');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'member/emailAddress',
      emailAddress: 'test',
      isValid: false,
    });
  });
});
