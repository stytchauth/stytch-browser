import { JSDOM } from 'jsdom';

declare global {
  const jsdom: JSDOM;

  const STYTCH_PACKAGE_NAME: string;
  const STYTCH_PACKAGE_VERSION: string;
}
