const DEFAULT_OTP_EXPIRATION_MS = 1000 * 60 * 10; // 10 minutes

export const getOtpCodeExpiration = () => new Date(Date.now() + DEFAULT_OTP_EXPIRATION_MS);
