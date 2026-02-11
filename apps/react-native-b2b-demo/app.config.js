export default ({ config }) => {
  return {
    ...config,
    extra: {
      eas: {
        projectId: 'b3fe4a2d-4855-4f25-872e-1ca530028365',
      },
      stytchPublicToken: process.env.STYTCH_PUBLIC_TOKEN,
      samlConnectionId: process.env.SAML_CONNECTION_ID,
      stytchOrgId: process.env.STYTCH_ORG_ID,
      stytchOauthUrl: process.env.STYTCH_OAUTH_URL,
    },
  };
};
