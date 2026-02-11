export enum Device {
  DESKTOP = 'Desktop device',
  MOBILE = 'Mobile device',
  UNKNOWN = 'Unknown device',
}

export const determineDeviceType = (userAgent: string): Device => {
  // TODO: Add more device types/ make more fine grained
  if (userAgent === '') {
    return Device.UNKNOWN;
  }

  // eslint-disable-next-line lingui/no-unlocalized-strings
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'windows phone'];
  userAgent = userAgent.toLowerCase();
  for (const keyword of mobileKeywords) {
    if (userAgent.includes(keyword)) {
      return Device.MOBILE;
    }
  }

  return Device.DESKTOP;
};

// This commonly occurs when a user tries to register a Passkey using a QR code on a separate device
// but the Passkey has already been sync'd to that device (e.g. the user registers an Apple passkey on their Macbook,
// it then syncs to their iPhone, and then they try to register the same Passkey on their iPhone). At some point we
// may be able to remove this logic when this is handled within the browser Passkeys UI.
export const SAFARI_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE =
  'At least one credential matches an entry of the excludeCredentials list in the platform attached authenticator.';
export const CHROME_CROSS_DEVICE_DUPLICATE_REG_ERROR_MESSAGE =
  'The user attempted to register an authenticator that contains one of the credentials already registered with the relying party.';
