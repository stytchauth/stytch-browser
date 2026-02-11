import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import { EmailOTPEntryScreen } from './EmailOTPEntryScreen';

const meta = {
  component: EmailOTPEntryScreen,
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [B2BProducts.emailOtp],
        },
        initialState: {
          flowState: {
            type: AuthFlowType.Discovery,
          },
          formState: {
            emailState: {
              userSuppliedEmail: 'test@example.com',
            },
            otpState: {
              codeExpiration: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof EmailOTPEntryScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DiscoveryFlow = {
  play: async ({ canvas }) => {
    const header = canvas.getByText('Enter passcode');
    const instruction = canvas.getByText(/A 6-digit passcode was sent to you at/);
    const resendButton = canvas.getByRole('button', { name: 'Resend code' });

    await expect(header).toBeInTheDocument();
    await expect(instruction).toBeInTheDocument();
    await expect(resendButton).toBeEnabled();
  },
} satisfies Story;

export const OrganizationFlow = {
  parameters: {
    stytch: {
      b2b: {
        initialState: {
          flowState: {
            type: AuthFlowType.Organization,
            organization: {
              organization_id: 'organization-test-123',
              organization_name: 'Test Organization',
              organization_slug: 'test-org',
              organization_logo_url: '',
              trusted_metadata: {},
            },
          },
          formState: {
            emailState: {
              userSuppliedEmail: 'user@testorg.com',
            },
            otpState: {
              codeExpiration: new Date(Date.now() + 1000 * 60 * 5),
            },
          },
        },
      },
    },
  },
  play: async ({ canvas }) => {
    const header = canvas.getByText('Enter passcode');
    const instruction = canvas.getByText(/A 6-digit passcode was sent to you at/);

    await expect(header).toBeInTheDocument();
    await expect(instruction).toBeInTheDocument();
  },
} satisfies Story;

export const ValidationError = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('One-time passcode'), '987654', { delay: 100 });

    await expect(canvas.getByText('Verifying passcode...')).toBeInTheDocument();

    const errorMessageEl = await waitFor(() => canvas.findByText('Unauthorized credentials.'));
    expect(errorMessageEl).toBeInTheDocument();
  },
} satisfies Story;
