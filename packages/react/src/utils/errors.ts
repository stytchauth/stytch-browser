export const noProviderError = (item: string, provider = 'StytchProvider'): string =>
  `${item} can only be used inside <${provider}>.`;
