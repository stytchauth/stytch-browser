import type { SessionDurationOptions } from '@stytch/core/public';

function isHandledTokenType<HandledTokenType extends string>(
  handledTypes: HandledTokenType[],
  tokenType: string,
): tokenType is HandledTokenType {
  return handledTypes.includes(tokenType as HandledTokenType);
}

export const clearStytchTokenParams = () => {
  const url = removeStytchTokenParams(window.location.toString());
  window.history.replaceState(null, document.title, url);
};

export type ParseAuthenticateUrl<HandledTokenType extends string> = (
  href?: string,
) =>
  | { handled: true; token: string; tokenType: HandledTokenType }
  | { handled: false; token: string; tokenType: string }
  | null;

export type AuthenticateByUrl<TokenType extends string> = (
  options: {
    /**
     * Clear token and stytch_token_type URL params after authenticate is called.
     * @default true if the href parameter is window.location.href (the default)
     **/
    clearParams?: boolean;
  } & SessionDurationOptions,

  /**
   * Allow overriding URL where the token and stytch_token_type params are extracted from.
   * You usually would not need to set this.
   * @default window.location.href
   */
  href?: string,
) => Promise<
  | {
      handled: true;
      tokenType: TokenType;
      data: unknown;
    }
  | {
      handled: false;
      tokenType: string;
      token: string;
    }
  | null
>;

/**
 * Creates both parseAuthenticateUrl and authenticateByUrl from the set of handlers passed in to ensure
 * both functions agree on what is handled.
 */
export const createAuthUrlHandler = <HandledTokenType extends string = string>(
  handlers: Record<HandledTokenType, (token: string, options: SessionDurationOptions) => Promise<unknown>>,
) => {
  const handledTokenTypes = Object.keys(handlers) as HandledTokenType[];

  const parseAuthenticateUrl: ParseAuthenticateUrl<HandledTokenType> = (href = window.location.href) => {
    const url = new URL(href);
    const tokenType = url.searchParams.get('stytch_token_type');
    const token = url.searchParams.get('token');
    if (!token || !tokenType) {
      return null;
    }

    if (isHandledTokenType(handledTokenTypes, tokenType)) {
      return {
        handled: true,
        token,
        tokenType,
      };
    }

    return {
      handled: false,
      token,
      tokenType,
    };
  };

  const authenticateByUrl: AuthenticateByUrl<HandledTokenType> = async (
    { clearParams, ...options },
    href = window.location.href,
  ) => {
    const shouldClearParams = clearParams ?? href === window.location.href;
    const parsed = parseAuthenticateUrl(href);
    if (parsed == null) return null;
    if (!parsed.handled) return parsed;

    const { token, tokenType } = parsed;
    const handler = handlers[tokenType as HandledTokenType];
    try {
      const data = await handler(token, options);
      return {
        handled: true,
        tokenType: tokenType as HandledTokenType,
        data,
      };
    } finally {
      if (shouldClearParams) {
        clearStytchTokenParams();
      }
    }
  };

  return {
    authenticateByUrl,
    parseAuthenticateUrl,
  };
};

// Exported for testing
export function removeStytchTokenParams(href: string) {
  const url = new URL(href);
  const params = url.searchParams;

  params.delete('token');
  params.delete('stytch_token_type');

  return url;
}
