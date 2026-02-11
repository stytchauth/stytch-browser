import { AuthFlowType, OrganizationBySlugMatch } from '@stytch/core/public';

import { emailMagicLinks, emailOtp, oauth, passwords, sso } from './B2BProducts';
import { generateProductComponentsOrdering } from './generateProductComponentsOrdering';
import { MainScreenComponent } from './types/AppScreens';
import { FlowState } from './types/AppState';
const mockOrganization: OrganizationBySlugMatch = {
  organization_id: '',
  organization_slug: 'test-org',
  sso_active_connections: [
    {
      connection_id: '',
      display_name: 'sso_1',
      identity_provider: 'generic',
    },
  ],
  organization_name: '',
  organization_logo_url: '',
  sso_default_connection_id: '',
  email_jit_provisioning: 'NOT_ALLOWED',
  email_allowed_domains: [],
  auth_methods: 'ALL_ALLOWED',
  allowed_auth_methods: [],
  mfa_policy: 'OPTIONAL',
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  allowed_oauth_tenants: {},
};
const mockOrganizationWithoutActiveSSO: OrganizationBySlugMatch = {
  organization_id: '',
  organization_slug: 'test-org-2',
  sso_active_connections: [],
  organization_name: '',
  organization_logo_url: '',
  sso_default_connection_id: '',
  email_jit_provisioning: 'NOT_ALLOWED',
  email_allowed_domains: [],
  auth_methods: 'ALL_ALLOWED',
  allowed_auth_methods: [],
  mfa_policy: 'OPTIONAL',
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  allowed_oauth_tenants: {},
};

describe('generateProductComponentsOrdering', () => {
  it('should generate component ordering correctly when displaying email magic links and passwords together', () => {
    const products = [emailMagicLinks, passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[MainScreenComponent.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying email OTPs and passwords together', () => {
    const products = [emailOtp, passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[MainScreenComponent.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying email magic links, email OTPs, and passwords together', () => {
    const products = [emailMagicLinks, emailOtp, passwords];

    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };

    const expectedComponents = [[MainScreenComponent.PasswordEmailCombined]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only email magic links', () => {
    const products = [emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[MainScreenComponent.EmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only email OTPs', () => {
    const products = [emailOtp];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[MainScreenComponent.EmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only passwords', () => {
    const products = [passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[MainScreenComponent.PasswordsEmailForm]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying password and oauth', () => {
    const products = [oauth, passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    // Different password component because > 1 product
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordsEmailForm],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying buttons and input (discovery)', () => {
    const products = [oauth, emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.EmailDiscoveryForm],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should show oauth before email input when passwords + one email method is used (discovery)', () => {
    const products = [oauth, emailMagicLinks, passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordEmailCombinedDiscovery],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should show oauth before email input when passwords + two email methods are used (discovery)', () => {
    const products = [oauth, emailMagicLinks, emailOtp, passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordEmailCombinedDiscovery],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with non-discovery versions', () => {
    const products = [emailMagicLinks, sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.EmailForm],
      [MainScreenComponent.Divider],
      [MainScreenComponent.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with discovery versions', () => {
    const products = [emailMagicLinks, sso];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.EmailDiscoveryForm],
      [MainScreenComponent.Divider],
      [MainScreenComponent.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying only buttons', () => {
    const products = [oauth, sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [[MainScreenComponent.OAuthButtons, MainScreenComponent.SSOButtons]];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly when displaying consecutive buttons', () => {
    const products = [oauth, sso, emailMagicLinks];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons, MainScreenComponent.SSOButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.EmailForm],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with a divider', () => {
    const products = [emailMagicLinks, passwords, oauth];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.PasswordEmailCombined],
      [MainScreenComponent.Divider],
      [MainScreenComponent.OAuthButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should generate component ordering correctly with multiple dividers', () => {
    const products = [oauth, passwords, sso];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordsEmailForm],
      [MainScreenComponent.Divider],
      [MainScreenComponent.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('should not include SSO component with no valid SSO connections', () => {
    const products = [emailMagicLinks, passwords, oauth, sso, emailOtp];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganizationWithoutActiveSSO,
    };
    const expectedComponents = [
      [MainScreenComponent.PasswordEmailCombined],
      [MainScreenComponent.Divider],
      [MainScreenComponent.OAuthButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('all components (non-discovery)', () => {
    const products = [oauth, passwords, emailMagicLinks, sso, emailOtp];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordEmailCombined],
      [MainScreenComponent.Divider],
      [MainScreenComponent.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('all components (discovery)', () => {
    const products = [oauth, passwords, emailMagicLinks, sso, emailOtp];
    const mockState: FlowState = {
      type: AuthFlowType.Discovery,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordEmailCombinedDiscovery],
      [MainScreenComponent.Divider],
      [MainScreenComponent.SSOButtons],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });

  it('passwords + oauth', () => {
    const products = [oauth, passwords];
    const mockState: FlowState = {
      type: AuthFlowType.Organization,
      organization: mockOrganization,
    };
    const expectedComponents = [
      [MainScreenComponent.OAuthButtons],
      [MainScreenComponent.Divider],
      [MainScreenComponent.PasswordsEmailForm],
    ];

    const result = generateProductComponentsOrdering(products, mockState);

    expect(result).toEqual(expectedComponents);
  });
});
