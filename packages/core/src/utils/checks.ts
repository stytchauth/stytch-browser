import { logger } from './logger';

const trailer = `
You can find your public token at https://stytch.com/dashboard/api-keys.`;
export const checkPublicToken = (publicToken: unknown) => {
  if (typeof publicToken !== 'string') {
    logger.warn(`Public token is malformed. Expected a string, got ${typeof publicToken}.${trailer}`);
  } else if (publicToken === '') {
    logger.warn(`Public token is malformed. Expected "public-token-...", got an empty string.${trailer}`);
  } else if (!publicToken.startsWith('public-token-')) {
    logger.warn(`Public token is malformed. Expected "public-token-...", got ${publicToken}.${trailer}`);
  }
};

export const checkNotSSR = (clientName: 'StytchUIClient' | 'StytchHeadlessClient') => {
  const factoryFunctionName = clientName === 'StytchUIClient' ? 'createStytchUIClient' : 'createStytchHeadlessClient';

  if (typeof window === 'undefined') {
    throw new Error(
      `\`new ${clientName}()\` is not supported in server environments. If using @stytch/react or @stytch/nextjs, use \`${factoryFunctionName}()\` instead.`,
    );
  }
};

export const checkB2BNotSSR = (clientName: 'StytchB2BUIClient' | 'StytchB2BHeadlessClient') => {
  const factoryFunctionName =
    clientName === 'StytchB2BUIClient' ? 'createStytchB2BUIClient' : 'createStytchB2BHeadlessClient';

  if (typeof window === 'undefined') {
    throw new Error(
      `\`new ${clientName}()\` is not supported in server environments. If using @stytch/react or @stytch/nextjs, use \`${factoryFunctionName}()\` instead.`,
    );
  }
};
