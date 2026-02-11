import { B2CUIAction } from '../actions';
import { UIState } from '../states';
import { DeeplinkReducer } from './DeeplinkReducer';
import { EMLReducer } from './EMLReducer';
import { NavigationReducer } from './NavigationReducer';
import { OAuthReducer } from './OAuthReducer';
import { OTPReducer } from './OTPReducer';
import { PasswordReducer } from './PasswordReducer';
import { UpdateStateReducer } from './UpdateStateReducer';
import { UserSearchReducer } from './UserSearchReducer';

export const GlobalReducer = (state: UIState, action: B2CUIAction): UIState => {
  switch (action.type) {
    case 'updateState/user/emailAddress':
    case 'updateState/user/phoneNumber':
    case 'updateState/user/password':
    case 'updateState/authentication/methodId':
    case 'updateState/authentication/token':
    case 'updateState/error/clear':
      return UpdateStateReducer(state, action);
    case 'userSearch':
    case 'userSearch/success':
    case 'userSearch/error':
      return UserSearchReducer(state, action);
    case 'oauth/start':
    case 'oauth/start/success':
    case 'oauth/start/error':
    case 'oauth/authenticate':
    case 'oauth/authenticate/success':
    case 'oauth/authenticate/error':
      return OAuthReducer(state, action);
    case 'eml/loginOrCreate':
    case 'eml/loginOrCreate/success':
    case 'eml/loginOrCreate/error':
    case 'eml/authenticate':
    case 'eml/authenticate/success':
    case 'eml/authenticate/error':
      return EMLReducer(state, action);
    case 'otp/email/loginOrCreate':
    case 'otp/email/loginOrCreate/success':
    case 'otp/email/loginOrCreate/error':
    case 'otp/sms/loginOrCreate':
    case 'otp/sms/loginOrCreate/success':
    case 'otp/sms/loginOrCreate/error':
    case 'otp/whatsapp/loginOrCreate':
    case 'otp/whatsapp/loginOrCreate/success':
    case 'otp/whatsapp/loginOrCreate/error':
    case 'otp/authenticate':
    case 'otp/authenticate/success':
    case 'otp/authenticate/error':
      return OTPReducer(state, action);
    case 'passwords/strengthCheck':
    case 'passwords/strengthCheck/success':
    case 'passwords/strengthCheck/error':
    case 'passwords/create':
    case 'passwords/create/success':
    case 'passwords/create/error':
    case 'passwords/authenticate':
    case 'passwords/authenticate/success':
    case 'passwords/authenticate/error':
    case 'passwords/resetByEmailStart':
    case 'passwords/resetByEmailStart/success':
    case 'passwords/resetByEmailStart/error':
    case 'passwords/resetByEmail':
    case 'passwords/resetByEmail/success':
    case 'passwords/resetByEmail/error':
      return PasswordReducer(state, action);
    case 'deeplink/parse':
    case 'deeplink/parse/ignored':
    case 'deeplink/parse/success':
    case 'deeplink/parse/error':
      return DeeplinkReducer(state, action);
    case 'navigate/goBack':
      return NavigationReducer(state, action);
  }
};
