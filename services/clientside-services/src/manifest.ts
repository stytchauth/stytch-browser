/**
 * All RPC Methods we currently support.
 *
 * This is the service-side equivalent to RPCManifest in @stytch/core. Unlike
 * the version in @stytch/core, this version covers all RPC methods supported
 * across all shipped versions of our web SDKs.
 *
 * Remember - once you add an RPC method, it must be backwards compatible ---
 * FOREVER! Making breaking changes can break old versions of the web SDKs, so
 * proceed with caution.
 *
 * I'll repeat it again - YOU CANNOT MAKE BACKWARDS INCOMPATIBLE CHANGES TO THIS
 * FILE.
 *
 * Rules of thumb:
 * - RPC methods should take in Object { } options and return Objects {} - this
 *   makes it far easier to add more params later
 * - Prefer one big single param over n-ary arguments.
 * - Make everything async. You'll never know if you'll add an async function
 *   call in the future.
 * - If you need to break a method, call it method2 and move on.
 */
export interface RPCManifest {
  oneTapStart: (req: OneTapStartRequest) => Promise<OneTapStartResponse>;
  oneTapSubmit: (req: OneTapSubmitRequest) => Promise<OneTapSubmitResponse>;
  parsedPhoneNumber: (req: ParsedPhoneNumberRequest) => Promise<ParsedPhoneNumberResponse>;
  getExamplePhoneNumber: (req: ExamplePhoneNumberRequest) => Promise<ExamplePhoneNumberResponse>;
}

type ExamplePhoneNumberRequest = {
  regionCode: string;
};

type ExamplePhoneNumberResponse = {
  phoneNumber?: string;
};

type ParsedPhoneNumberRequest = {
  phoneNumber: string;
  regionCode?: string;
};

type ParsedPhoneNumberResponse = {
  isValid: boolean;
  number: string;
  national: string;
};

type OneTapStartRequest = {
  publicToken: string;
};

type OneTapStartResponse = {
  requestId: string;
  googleClientId: string;
  stytchCsrfToken: string;
  oauthCallbackId: string;
};

type OneTapSubmitRequest = {
  publicToken: string;
  idToken: string;
  oauthCallbackID: string;
  loginRedirectURL?: string;
  signupRedirectURL?: string;
};

type OneTapSubmitResponse = {
  redirect_url: string;
};
