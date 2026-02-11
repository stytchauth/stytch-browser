import { B2BUIAction } from '../actions';
import { UIState } from '../states';
import { DeeplinkReducer } from './DeeplinkReducer';
import { EmailOTPReducer } from './EmailOTPReducer';
import { MagicLinksReducer } from './MagicLinksReducer';
import { MFAReducer } from './MFAReducer';
import { NavigationReducer } from './NavigationReducer';
import { OAuthReducer } from './OAuthReducer';
import { OrganizationReducer } from './OrganizationReducer';
import { PasswordStateReducer } from './PasswordStateReducer';
import { SSOReducer } from './SSOReducer';
import { UpdateAuthenticationStateReducer } from './UpdateAuthenticationStateReducer';
import { UpdateDiscoveryStateReducer } from './UpdateDiscoveryStateReducer';
import { UpdateMemberStateReducer } from './UpdateMemberStateReducer';
import { UpdateScreenStateReducer } from './UpdateScreenStateReducer';

export const GlobalReducer = (state: UIState, action: B2BUIAction): UIState => {
  switch (action.type) {
    case 'authentication/flowType':
    case 'authentication/methodId':
    case 'authentication/token':
      return UpdateAuthenticationStateReducer(state, action);
    case 'deeplink/handlerRegistered':
    case 'deeplink/parse':
    case 'deeplink/parse/error':
    case 'deeplink/parse/ignored':
    case 'deeplink/parse/success':
      return DeeplinkReducer(state, action);
    case 'discovery/selectDiscoveredOrganization':
    case 'discovery/setDiscoveredOrganizations':
    case 'discovery/organizations/create':
    case 'discovery/organizations/create/success':
    case 'discovery/organizations/create/error':
    case 'discovery/intermediateSessions/exchange':
    case 'discovery/intermediateSessions/exchange/success':
    case 'discovery/intermediateSessions/exchange/error':
      return UpdateDiscoveryStateReducer(state, action);
    case 'error/clear':
      return UpdateScreenStateReducer(state, action);
    case 'magicLinks/authenticate':
    case 'magicLinks/authenticate/success':
    case 'magicLinks/authenticate/error':
    case 'magicLinks/discovery/authenticate':
    case 'magicLinks/discovery/authenticate/success':
    case 'magicLinks/discovery/authenticate/error':
    case 'magicLinks/email/loginOrSignup':
    case 'magicLinks/email/loginOrSignup/success':
    case 'magicLinks/email/loginOrSignup/error':
    case 'magicLinks/email/discovery/send':
    case 'magicLinks/email/discovery/send/success':
    case 'magicLinks/email/discovery/send/error':
      return MagicLinksReducer(state, action);
    case 'emailOTP/authenticate':
    case 'emailOTP/authenticate/success':
    case 'emailOTP/authenticate/error':
    case 'emailOTP/discovery/authenticate':
    case 'emailOTP/discovery/authenticate/success':
    case 'emailOTP/discovery/authenticate/error':
    case 'emailOTP/email/loginOrSignup':
    case 'emailOTP/email/loginOrSignup/success':
    case 'emailOTP/email/loginOrSignup/error':
    case 'emailOTP/email/discovery/send':
    case 'emailOTP/email/discovery/send/success':
    case 'emailOTP/email/discovery/send/error':
      return EmailOTPReducer(state, action);
    case 'mfa/primaryAuthenticate':
    case 'mfa/primaryAuthenticate/success':
    case 'mfa/recoveryCode/authenticate':
    case 'mfa/recoveryCode/authenticate/success':
    case 'mfa/recoveryCode/authenticate/error':
    case 'mfa/recoveryCode/download/error':
    case 'mfa/recoveryCode/navigateToEntry':
    case 'mfa/recoveryCode/saveAcknowledge':
    case 'mfa/smsOtp/authenticate':
    case 'mfa/smsOtp/authenticateSuccess':
    case 'mfa/smsOtp/authenticateError':
    case 'mfa/smsOtp/navigateToEntry':
    case 'mfa/smsOtp/send':
    case 'mfa/smsOtp/send/error':
    case 'mfa/smsOtp/send/success':
    case 'mfa/startEnrollment':
    case 'mfa/totp/authenticate':
    case 'mfa/totp/authenticate/success':
    case 'mfa/totp/authenticate/error':
    case 'mfa/totp/create':
    case 'mfa/totp/create/error':
    case 'mfa/totp/create/success':
    case 'mfa/totp/navigateToEntry':
    case 'mfa/totp/showCode':
      return MFAReducer(state, action);
    case 'navigate/goBack':
    case 'navigate/to':
    case 'navigate/reset':
      return NavigationReducer(state, action);
    case 'oauth/start':
    case 'oauth/start/error':
    case 'oauth/start/success':
    case 'oauth/authenticate':
    case 'oauth/authenticate/success':
    case 'oauth/authenticate/error':
    case 'oauth/discovery/authenticate':
    case 'oauth/discovery/authenticate/success':
    case 'oauth/discovery/authenticate/error':
      return OAuthReducer(state, action);
    case 'organization/getBySlug':
    case 'organization/getBySlug/success':
    case 'organization/getBySlug/error':
      return OrganizationReducer(state, action);
    case 'passwords/strengthCheck':
    case 'passwords/strengthCheck/error':
    case 'passwords/strengthCheck/success':
    case 'passwords/authenticate/start':
    case 'passwords/authenticate':
    case 'passwords/authenticate/error':
    case 'passwords/authenticate/success':
    case 'passwords/resetByEmail':
    case 'passwords/resetByEmail/error':
    case 'passwords/resetByEmail/success':
    case 'passwords/resetByEmailStart':
    case 'passwords/resetByEmailStart/error':
    case 'passwords/resetByEmailStart/success':
    case 'passwords/resetBySession':
    case 'passwords/resetBySession/error':
    case 'passwords/resetBySession/success':
    case 'passwords/resetPassword':
    case 'passwords/resetPassword/error':
    case 'passwords/resetPassword/success':
    case 'passwords/discovery/resetByEmailStart':
    case 'passwords/discovery/resetByEmailStart/error':
    case 'passwords/discovery/resetByEmailStart/success':
    case 'passwords/discovery/resetByEmail':
    case 'passwords/discovery/resetByEmail/error':
    case 'passwords/discovery/resetByEmail/success':
    case 'passwords/discovery/authenticate':
    case 'passwords/discovery/authenticate/error':
    case 'passwords/discovery/authenticate/success':
      return PasswordStateReducer(state, action);
    case 'sso/start':
    case 'sso/start/success':
    case 'sso/start/error':
    case 'sso/authenticate':
    case 'sso/authenticate/success':
    case 'sso/authenticate/error':
    case 'sso/discovery':
    case 'sso/discovery/success':
    case 'sso/discovery/error':
      return SSOReducer(state, action);
    case 'member/emailAddress':
    case 'member/emailAddress/didFinish':
    case 'member/phoneNumber':
    case 'member/password':
      return UpdateMemberStateReducer(state, action);
  }
};
