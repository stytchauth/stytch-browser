import type { Meta, StoryObj } from '@storybook/react';
import { OTPAuthenticate } from './OTPAuthenticate';
import { AppState } from '../../GlobalContextProvider';
import { DeepPartial } from '../../../../testUtils';

const meta = {
  component: OTPAuthenticate,
  args: {
    hideBackArrow: true,
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
