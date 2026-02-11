import { Meta, StoryObj } from '@storybook/preact';
import { PasskeyRegistrationSuccess } from './PasskeyRegistrationSuccess';
import { PasskeyHandlers, passkeyUpdateErrorHandlers } from '../../../../testing/msw/passkeyHandlers';

const passkeyHandlers = new PasskeyHandlers();

const meta = {
  component: PasskeyRegistrationSuccess,
  parameters: {
    msw: {
      handlers: passkeyHandlers.handlers,
    },
  },
} satisfies Meta<typeof PasskeyRegistrationSuccess>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _PasskeyRegistrationSuccess = {} satisfies Story;

export const Error = {
  parameters: {
    msw: {
      handlers: {
        ...passkeyHandlers.handlers,
        ...passkeyUpdateErrorHandlers(),
      },
    },
  },
} satisfies Story;
