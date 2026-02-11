import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { useUpdateUserEmailAddress } from './updateUserEmailAddress';

describe('updateUserEmailAddress', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
  });
  it('dispatches the expected action for good emails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setUserEmailAddress } = useUpdateUserEmailAddress();
    setUserEmailAddress('my@email.com');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'updateState/user/emailAddress',
      emailAddress: 'my@email.com',
      isValid: true,
    });
  });
  it('dispatches the expected action for bad emails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { setUserEmailAddress } = useUpdateUserEmailAddress();
    setUserEmailAddress('test');
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenLastCalledWith({
      type: 'updateState/user/emailAddress',
      emailAddress: 'test',
      isValid: false,
    });
  });
});
