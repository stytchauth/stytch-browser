/**
 * RPC methods supported by clientside-services
 */
export interface RPCManifest {
  oneTapStart: (req: OneTapStartRequest) => Promise<OneTapStartResponse>;
  oneTapSubmit: (req: OneTapSubmitRequest) => Promise<OneTapSubmitResponse>;
  parsedPhoneNumber: (req: ParsedPhoneNumberRequest) => Promise<ParsedPhoneNumberResponse>;
}

export type ParsedPhoneNumberRequest = {
  phoneNumber: string;
  regionCode?: string;
};

export type ParsedPhoneNumberResponse = {
  isValid: boolean;
  number: string;
  national: string;
};

export type OneTapStartRequest = {
  publicToken: string;
};

export type OneTapStartResponse = {
  requestId: string;
  googleClientId: string;
  stytchCsrfToken: string;
  oauthCallbackId: string;
};

export type OneTapSubmitRequest = {
  publicToken: string;
  idToken: string;
  oauthCallbackID: string;
  loginRedirectURL?: string;
  signupRedirectURL?: string;
};

export type OneTapSubmitResponse = {
  redirect_url: string;
};
