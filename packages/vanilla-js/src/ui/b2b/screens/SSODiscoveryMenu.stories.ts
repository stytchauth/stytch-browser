import { Meta, StoryObj } from '@storybook/react';
import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import { MOCK_SSO_CONNECTIONS } from '@stytch/internal-mocks';
import Container from '../Container';
import { MOCK_ORGANIZATION } from '../../../testUtils';

const meta = {
  component: Container,
  parameters: {
    stytch: {
      b2b: {
        config: {
          products: [B2BProducts.sso],
        },
        initialState: {
          flowState: {
            type: AuthFlowType.Organization,
            organization: {
              ...MOCK_ORGANIZATION,
              sso_active_connections: MOCK_SSO_CONNECTIONS,
            },
          },
        },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const _SSODiscoveryMenu = {} satisfies Story;
