/**
 * A set of tokens to stylize the console.log output
 * First token is the raw text. %c is a placeholder for string formatting
 * Second token starts our stylizing - adding custom color and background
 * Third token resets stylizing to baseline before showing the rest of the content.
 */
const STYTCH_BADGE =
  process.env.NODE_ENV === 'production'
    ? ['[Stytch]']
    : ['%c[Stytch]%c', 'background: #19303d; color: #13E5C0; padding: 2px;border-radius: 4px', ''];

// Turn this to true to enable debug logs
// TODO: Make this an env var
const DEBUG = false;

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An ultralightweight wrapper around console.log.
 * In the future, the logger might be passed in from the customer,
 * or the level might be configurable.
 */
export const logger = {
  debug: (...args: any[]) => DEBUG && console.log(...STYTCH_BADGE, ...args),
  log: (...args: any[]) => console.log(...STYTCH_BADGE, ...args),
  warn: (...args: any[]) => console.warn(...STYTCH_BADGE, ...args),
  error: (...args: any[]) => console.error(...STYTCH_BADGE, ...args),
};

/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable no-console */
