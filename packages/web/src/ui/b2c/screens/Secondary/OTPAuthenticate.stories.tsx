import type { Meta, StoryObj } from '@storybook/react-vite';

import { DeepPartial } from '../../../../testUtils';
import { AppState } from '../../GlobalContextProvider';
import { OTPAuthenticate } from './OTPAuthenticate';

const meta = {
  component: OTPAuthenticate,
  args: {
    hideBackButton: true,
  },
  parameters: {
    stytch: {
      b2c: {
        initialState: {
          formState: {
            otpState: {
              otpDestination: '+15005550006',
            },
          },
        } satisfies DeepPartial<AppState>,
      },
    },
  },
} satisfies Meta<typeof OTPAuthenticate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _OTPAuthenticate = {} satisfies Story;
