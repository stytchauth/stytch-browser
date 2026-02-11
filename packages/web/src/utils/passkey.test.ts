import { determineDeviceType, Device } from './passkeys';

describe('determineDeviceType', () => {
  it('should correctly detect mobile user agent', () => {
    const mobileUserAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1';
    expect(determineDeviceType(mobileUserAgent)).toBe(Device.MOBILE);
  });

  it('should correctly detect desktop user agent', () => {
    const desktopUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36';
    expect(determineDeviceType(desktopUserAgent)).toBe(Device.DESKTOP);
  });

  it('should handle lowercase user agent', () => {
    const mobileUserAgent =
      'mozilla/5.0 (iphone; cpu iphone os 14_5 like mac os x) applewebkit/605.1.15 (khtml, like gecko) version/14.1 mobile/15e148 safari/604.1';
    const desktopUserAgent =
      'mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/90.0.4430.212 safari/537.36';

    expect(determineDeviceType(mobileUserAgent)).toBe(Device.MOBILE);
    expect(determineDeviceType(desktopUserAgent)).toBe(Device.DESKTOP);
  });

  it('should handle various mobile keywords', () => {
    const androidUserAgent =
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Mobile Safari/537.36';
    const windowsPhoneUserAgent =
      'Mozilla/5.0 (Windows Phone 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36';

    expect(determineDeviceType(androidUserAgent)).toBe(Device.MOBILE);
    expect(determineDeviceType(windowsPhoneUserAgent)).toBe(Device.MOBILE);
  });

  it('should return unknown for empty user agent', () => {
    const emptyUserAgent = '';

    expect(determineDeviceType(emptyUserAgent)).toBe(Device.UNKNOWN);
  });
});
