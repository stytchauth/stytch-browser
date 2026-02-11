import { Session, User, WebAuthnAuthenticateResponse, WebAuthnRegistration } from '@stytch/core/public';
import {
  MOCK_RECOVERABLE_ERROR_DATA,
  MOCK_SESSION,
  MOCK_USER,
  MOCK_WEBAUTHN_REGISTRATIONS,
} from '@stytch/internal-mocks';
import { delay, http, HttpResponse } from 'msw';

import { authenticateResponseSuccess, OverrideHandlers } from '../../../.storybook/handlers';
import { StytchClient } from '../../StytchClient';

/* eslint-disable lingui/no-unlocalized-strings */

/**
 * Creates a set of stateful MSW handlers simulating passkey server routes
 */
export class PasskeyHandlers {
  /**
   * Note: Registrations are updated immutably, you need to call getRegistration()
   * to get the current registration
   */
  registrations = [...MOCK_WEBAUTHN_REGISTRATIONS];
  counter = 0;

  constructor(private networkDelay?: number) {}

  reset() {
    this.registrations = [...MOCK_WEBAUTHN_REGISTRATIONS];
  }

  getUser() {
    return {
      ...MOCK_USER,
      webauthn_registrations: this.registrations,
    } as User;
  }

  getRegistration(idOrRegistration: string | WebAuthnRegistration) {
    const id = typeof idOrRegistration === 'string' ? idOrRegistration : idOrRegistration.webauthn_registration_id;
    return this.registrations.find((r) => r.webauthn_registration_id === id);
  }

  /**
   * We can't feasibly mock out the browser's WebAuthn APIs right now so we just mock out
   * the entire `register()` function on the HeadlessWebauthnClient instead
   * @param client
   * @param error If provided, the function will be mocked to error instead
   */
  mockRegister(client: StytchClient, error?: Error) {
    jest.spyOn(client.webauthn, 'register').mockImplementation(async () => {
      if (error) {
        throw error;
      }

      const webauthn_registration_id = `webauthn-registration-test-${++this.counter}`;
      const registration: WebAuthnRegistration = {
        webauthn_registration_id,
        authenticator_type: '',
        domain: 'example.com',
        name: `Test WebAuthN ${this.counter}`,
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        verified: true,
      };

      this.registrations.push(registration);
      const user = this.getUser();
      // Refresh user
      await client.user.get();
      return {
        session: MOCK_SESSION as Session,
        user_id: user.user_id,
        user,
        webauthn_registration_id,
      } as WebAuthnAuthenticateResponse;
    });
  }

  handlers = {
    getUser: http.get('https://api.stytch.com/sdk/v1/users/me', async () => {
      await delay(this.networkDelay);
      return HttpResponse.json({
        data: this.getUser(),
      });
    }),

    sessionAuthenticate: http.post('https://api.stytch.com/sdk/v1/sessions/authenticate', async () => {
      await delay(this.networkDelay);
      const user = this.getUser();
      return HttpResponse.json({
        data: {
          ...authenticateResponseSuccess,
          user,
          __user: user,
        },
      });
    }),

    webAuthnUpdate: http.put<{ id: string }, { name: string }>(
      'https://api.stytch.com/sdk/v1/webauthn/update/:id',
      async ({ request, params }) => {
        await delay(this.networkDelay);
        const body = await request.json();
        this.registrations = this.registrations.map((r) =>
          r.webauthn_registration_id === params.id ? { ...r, name: body.name } : r,
        );
        return HttpResponse.json({
          data: this.registrations.find((r) => r.webauthn_registration_id === params.id),
        });
      },
    ),

    webAuthnDelete: http.delete<{ id: string }>(
      'https://api.stytch.com/sdk/v1/users/webauthn_registrations/:id',
      async ({ params }) => {
        await delay(this.networkDelay);
        this.registrations = this.registrations.filter((r) => r.webauthn_registration_id !== params.id);
        const user = this.getUser();
        return HttpResponse.json({
          data: {
            __user: user,
            user_id: user.user_id,
          },
        });
      },
    ),
  } satisfies OverrideHandlers;
}

/**
 * Simulates the passkey update and delete routes erroring
 */
export const passkeyUpdateErrorHandlers = ({ networkDelay = 300 }: { networkDelay?: number } = {}) =>
  ({
    webAuthnUpdate: http.put<{ id: string }, { name: string }>(
      'https://api.stytch.com/sdk/v1/webauthn/update/:id',
      async () => {
        await delay(networkDelay);
        return HttpResponse.json(MOCK_RECOVERABLE_ERROR_DATA, { status: 500 });
      },
    ),

    webAuthnDelete: http.delete<{ id: string }>(
      'https://api.stytch.com/sdk/v1/users/webauthn_registrations/:id',
      async () => {
        await delay(networkDelay);
        return HttpResponse.json(MOCK_RECOVERABLE_ERROR_DATA, { status: 500 });
      },
    ),
  }) satisfies OverrideHandlers;
