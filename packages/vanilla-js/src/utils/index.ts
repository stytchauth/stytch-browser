import {
  EmailMagicLinksOptions,
  MagicLinksLoginOrCreateOptions,
  PasswordOptions,
  PasswordResetByEmailStartOptions,
} from '@stytch/core/public';

// You can't actually validate email just from regex. RFC 5322 is pretty complex and there are some *wild*
// rules that we would never really expect to handle, but are technically valid like:
//   1. Emails can contain comments -> cursed(comment)@example.com
//   2. Emails can contain symbols -> cursed{email}@example.com != cursedemail@example.com
//   3. Dots are allowed, but not consecutively -> ab.cd@example.com is okay, but not ab..cd@example.com
//   4. ... unless quoted -> "ab..cd"@example.com is okay
//      because yes, emails can also contain quotes
//      but then they *can't* contain comments
//   5. Emails can also consist of spaces and tabs if you use quoting
//
// TL;DR: it's really complicated. I once heard a joke that the only real way to validate an email is to check
// for the presence of an @ symbol and then see if you can send an email without it bouncing. Anyway, the below
// regex *attempts* to make some limitations on the regex to help end-users while not being overly constrained.
// We relaxed it as part of https://linear.app/stytch/issue/OBACK-583/email-pattern-bug-in-fe-sdk if you want some
// historical context here.
export const EMAIL_REGEX = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const convertMagicLinkOptions = (options: EmailMagicLinksOptions = {}): MagicLinksLoginOrCreateOptions => ({
  signup_magic_link_url: options.signupRedirectURL,
  signup_expiration_minutes: options.signupExpirationMinutes,
  login_magic_link_url: options.loginRedirectURL,
  login_expiration_minutes: options.loginExpirationMinutes,
  login_template_id: options.loginTemplateId,
  signup_template_id: options.signupTemplateId,
  locale: options.locale,
});

export const convertPasswordResetOptions = (
  email: string,
  options: PasswordOptions = {},
): PasswordResetByEmailStartOptions => ({
  email: email,
  login_redirect_url: options.loginRedirectURL,
  login_expiration_minutes: options.loginExpirationMinutes,
  reset_password_redirect_url: options.resetPasswordRedirectURL,
  reset_password_expiration_minutes: options.resetPasswordExpirationMinutes,
  reset_password_template_id: options.resetPasswordTemplateId,
  locale: options.locale,
});

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(func: F, waitFor = 500) => {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor) as unknown as NodeJS.Timeout;
  };

  return debounced;
};
// Borrowed from Create React App's service worker registration logic
export const isLocalhost = () =>
  Boolean(
    window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
  );

export type DeepRequired<T> = { [K in keyof T]: DeepRequired<T[K]> } & Required<T>;

export const hasMultipleCookies = (cookieName: string) => {
  const cookiePairs = document.cookie ? document.cookie.split('; ') : [];
  const matchedCookies = cookiePairs.filter((pair) => {
    const [name] = pair.split('=');
    return cookieName === name;
  });

  return matchedCookies.length > 1;
};
