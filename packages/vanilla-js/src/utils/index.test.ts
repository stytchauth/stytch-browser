import { EMAIL_REGEX, hasMultipleCookies } from '.';
import Cookies from 'js-cookie';

describe('hasMultipleCookies', () => {
  const COOKIE_NAME = 'cookie';
  beforeEach(() => {
    jsdom.reconfigure({
      url: 'http://subdomain.example.com',
    });
    Cookies.remove(COOKIE_NAME);
    Cookies.remove(COOKIE_NAME, { domain: 'example.com' });
  });

  it('returns false if no cookies are present', () => {
    expect(hasMultipleCookies(COOKIE_NAME)).toEqual(false);
  });

  it('returns false if only one cookie is present', () => {
    Cookies.set(COOKIE_NAME, 'value1');
    expect(hasMultipleCookies(COOKIE_NAME)).toEqual(false);
  });

  it('returns true if two cookies is present', () => {
    Cookies.set(COOKIE_NAME, 'value1');
    Cookies.set(COOKIE_NAME, 'value2', { domain: 'example.com' });
    expect(hasMultipleCookies(COOKIE_NAME)).toEqual(true);
  });
});

describe('email regex', () => {
  it('handles a basic email', () => {
    expect('hello@example.com').toMatch(EMAIL_REGEX);
  });
  it('handles an email with a subaddress', () => {
    expect('hello+world@example.com').toMatch(EMAIL_REGEX);
  });
  it('handles an email with a subdomain', () => {
    expect('hello@world.example.com').toMatch(EMAIL_REGEX);
  });
  it('handles an email with special characters', () => {
    expect('hello.world{foo}bar+baz!@example.com').toMatch(EMAIL_REGEX);
  });
  it('rejects an email without a domain', () => {
    expect('hello@'.match(EMAIL_REGEX)).toBeNull();
  });
  it('rejects an email without a TLD', () => {
    expect('hello@example'.match(EMAIL_REGEX)).toBeNull();
  });
  it('rejects quoted emails', () => {
    expect('"hello"@example.com'.match(EMAIL_REGEX)).toBeNull();
  });
});
