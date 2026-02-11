export const getHttpsUrl = (urlOrDomain: string) => {
  // If it's already a valid URL, extract the domain
  try {
    const url = new URL(urlOrDomain);
    return `https://${url.hostname}`;
  } catch {
    // invalid URLs are OK
  }

  // Prepend a scheme and verify it's a valid URL
  try {
    const url = new URL(`https://${urlOrDomain}`);
    return `https://${url.hostname}`;
  } catch {
    // Invalid URL, fallback to undefined
  }

  // Input was neither a valid URL nor a valid domain
  return undefined;
};
