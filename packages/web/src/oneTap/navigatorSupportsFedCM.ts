// Inspired by https://developers.google.com/privacy-sandbox/3pcd/fedcm-developer-guide#sign-into-rp
export const navigatorSupportsFedCM = typeof window !== 'undefined' && 'IdentityCredential' in window;
