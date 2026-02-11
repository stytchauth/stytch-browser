import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';

// TODO: Add .env.prod and copy logic when we start e2e testing in prod
const paths = ['.env.local', '.env.staging'];

for (const path of paths) {
  // eslint-disable-next-line no-console
  console.log('Attempting to apply env vars at', path);
  const output = dotenv.config({ path });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (output.error && output.error.code === 'ENOENT') {
    // eslint-disable-next-line no-console
    console.log('Unable to apply', path, 'falling back to next opt');
  } else {
    break;
  }
}

const baseUrl = process.env.CYPRESS_BASE_URL;
if (!baseUrl) {
  throw Error('Missing process.env.CYPRESS_BASE_URL');
}

const B2B_BASE_URL = process.env.CYPRESS_B2B_BASE_URL;
if (!B2B_BASE_URL) {
  throw Error('Missing process.env.CYPRESS_B2B_BASE_URL');
}

const MAILOSAUR_SERVER_ID = process.env.CYPRESS_MAILOSAUR_SERVER_ID;
if (!MAILOSAUR_SERVER_ID) {
  throw Error('Missing process.env.CYPRESS_MAILOSAUR_SERVER_ID');
}

const MAILOSAUR_API_KEY = process.env.CYPRESS_MAILOSAUR_API_KEY;
if (!MAILOSAUR_API_KEY) {
  throw Error('Missing process.env.CYPRESS_MAILOSAUR_API_KEY');
}

const env = {
  emailName: 'stytchtesting',
  // These should match any project name ie - Your account creation request for FooCorp
  newEmailSubjectLine: 'Your account creation request for ',
  existingEmailSubjectLine: 'Your login request to ',

  /** Comma separated addresses the login emails should be from */
  fromEmail: ['login@staging.stytch.com', 'login@staging.stytchtest.com'].join(','),

  // "authenticateUrl": "https://stytch.com/authenticate",
  // "signUpUrl": "https://stytch.com/sign-up",
  B2B_BASE_URL,
  MAILOSAUR_SERVER_ID,
  MAILOSAUR_API_KEY,
} as const satisfies Record<string, unknown>;

export default defineConfig({
  e2e: { baseUrl },
  projectId: '77ifcc',
  includeShadowDom: true,
  env,
});

export type CypressEnv = typeof env;
