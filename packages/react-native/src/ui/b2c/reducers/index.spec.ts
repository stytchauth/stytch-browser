import { GlobalReducer } from '.';
import { DEFAULT_RENDER_PROPS } from '../testUtils';
import { DeeplinkReducer } from './DeeplinkReducer';
import { EMLReducer } from './EMLReducer';
import { NavigationReducer } from './NavigationReducer';
import { OAuthReducer } from './OAuthReducer';
import { OTPReducer } from './OTPReducer';
import { PasswordReducer } from './PasswordReducer';
import { UpdateStateReducer } from './UpdateStateReducer';
import { UserSearchReducer } from './UserSearchReducer';

jest.mock('./DeeplinkReducer');
const DeeplinkReducerMock = jest.mocked(DeeplinkReducer);
jest.mock('./EMLReducer');
const EMLReducerMock = jest.mocked(EMLReducer);
jest.mock('./NavigationReducer');
const NavigationReducerMock = jest.mocked(NavigationReducer);
jest.mock('./OAuthReducer');
const OAuthReducerMock = jest.mocked(OAuthReducer);
jest.mock('./OTPReducer');
const OTPReducerMock = jest.mocked(OTPReducer);
jest.mock('./PasswordReducer');
const PasswordReducerMock = jest.mocked(PasswordReducer);
jest.mock('./UpdateStateReducer');
const UpdateStateReducerMock = jest.mocked(UpdateStateReducer);
jest.mock('./UserSearchReducer');
const UserSearchReducerMock = jest.mocked(UserSearchReducer);

describe('Reducer map', () => {
  it('delegates to the correct reducer', () => {
    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], {
      type: 'updateState/user/emailAddress',
      emailAddress: '',
      isValid: false,
    });
    expect(UpdateStateReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'userSearch' });
    expect(UserSearchReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'oauth/start' });
    expect(OAuthReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'eml/loginOrCreate' });
    expect(EMLReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'otp/email/loginOrCreate' });
    expect(OTPReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'passwords/strengthCheck' });
    expect(PasswordReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'deeplink/parse' });
    expect(DeeplinkReducerMock).toHaveBeenCalled();

    GlobalReducer(DEFAULT_RENDER_PROPS.state[0], { type: 'navigate/goBack' });
    expect(NavigationReducerMock).toHaveBeenCalled();
  });
});
