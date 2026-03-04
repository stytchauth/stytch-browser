import { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';

import { OverrideHandlers } from '../../../../../.storybook/handlers';
import { PasskeyRegistrationStart } from './PasskeyRegistrationStart';

const meta = {
  component: PasskeyRegistrationStart,
} satisfies Meta<typeof PasskeyRegistrationStart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasskeyRegistrationStart = {} satisfies Story;

export const NotLoggedIn = {
  ..._PasskeyRegistrationStart,
  parameters: {
    msw: {
      handlers: {
        getUser: http.get('https://api.stytch.com/sdk/v1/users/me', async () => {
          await delay(300);
          return HttpResponse.json(
            {
              //
            },
            { status: 401 },
          );
        }),
      } satisfies OverrideHandlers,
    },
  },
} satisfies Story;
