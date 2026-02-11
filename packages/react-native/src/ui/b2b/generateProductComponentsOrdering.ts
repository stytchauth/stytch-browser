import { StringLiteralFromEnum } from '@stytch/core';
import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import { AuthenticationState } from './states';
export enum Component {
  EmailForm = 'EmailForm',
  EmailDiscoveryForm = 'EmailDiscoveryForm',
  OAuthButtons = 'OAuthButtons',
  SSOButtons = 'SSOButtons',
  PasswordsEmailForm = 'PasswordsEmailForm',
  PasswordEmailCombined = 'PasswordEmailCombined',
  PasswordEmailCombinedDiscovery = 'PasswordEmailCombinedDiscovery',
  Divider = 'Divider',
}

/*
  Here we are generating the ordering and which components will be displayed.
  We use the Component enum this because there is some complex logic here, and
  we want to be able to unit test.
  
  Rules we want to follow when generating the components:
  1. If we're displaying both email and passwords, we need to display them together
  as a single wrapped component. The index of this wrapped component is equivalent to the first index of 
  either email or passwords in the config products list.
  2. If we have both buttons and input, we want to display a divider between the last 2 elements. 
  3. Some components have both a discovery and a non-discovery version. We want to display the correct version 
  based on the flow type (found in state).
  4. We want to display the components in the order that they are listed in the config.

  This function should be considered the source of truth for which components to render
  and what order to render them in as of 6/21/23.
*/
export const generateProductComponentsOrdering = (
  products: StringLiteralFromEnum<B2BProducts>[],
  authenticationState: AuthenticationState,
): Component[] => {
  const flowStateType = authenticationState.authFlowType;
  const displayEmail = products.includes(B2BProducts.emailMagicLinks) || products.includes(B2BProducts.emailOtp);
  const displayEmailAndPasswordsTogether = displayEmail && products.includes(B2BProducts.passwords);
  const emailPasswordCombinedComponent =
    flowStateType === AuthFlowType.Organization
      ? Component.PasswordEmailCombined
      : Component.PasswordEmailCombinedDiscovery;

  const ProductComponents = products
    .map((product) => {
      switch (product) {
        case B2BProducts.emailMagicLinks:
        case B2BProducts.emailOtp:
          if (displayEmailAndPasswordsTogether) {
            return emailPasswordCombinedComponent;
          }
          return flowStateType === AuthFlowType.Organization ? Component.EmailForm : Component.EmailDiscoveryForm;
        case B2BProducts.oauth:
          return Component.OAuthButtons;
        case B2BProducts.sso: {
          const isSsoValid = (authenticationState.organization?.sso_active_connections?.length ?? 0) > 0;
          return flowStateType === AuthFlowType.Discovery || (AuthFlowType.Organization && isSsoValid)
            ? Component.SSOButtons
            : null;
        }
        case B2BProducts.passwords:
          return displayEmailAndPasswordsTogether ? emailPasswordCombinedComponent : Component.PasswordsEmailForm;
      }
    })
    .filter((component) => component !== null) as Component[];

  // If we're displaying both email and passwords, we need to display them together
  if (displayEmailAndPasswordsTogether) {
    // Get first index of either email or passwords
    const emailMagicLinkslIndex = products.indexOf(B2BProducts.emailMagicLinks);
    const emailOTPIndex = products.indexOf(B2BProducts.emailOtp);
    const passwordIndex = products.indexOf(B2BProducts.passwords);
    const firstEmailIndex = Math.min(emailMagicLinkslIndex, emailOTPIndex);
    const firstProductIndex = Math.min(passwordIndex, firstEmailIndex);

    // Insert combined component into first index of either email or passwords
    ProductComponents.splice(firstProductIndex, 0, emailPasswordCombinedComponent);
  }

  let uniqueProductComponents = [...new Set(ProductComponents)];

  // If we have both buttons and input, we want to display a divider between them
  if (uniqueProductComponents.length > 1) {
    const updatedComponents: Component[] = [];

    uniqueProductComponents.forEach((component, index) => {
      // Define variables for readability
      const shouldAddDivider =
        component === Component.EmailForm ||
        component === Component.EmailDiscoveryForm ||
        component === Component.PasswordsEmailForm ||
        component === Component.PasswordEmailCombined ||
        component === Component.PasswordEmailCombinedDiscovery;

      // Add a divider before the component if needed
      if (shouldAddDivider && index > 0) {
        updatedComponents.push(Component.Divider);
      }

      // Add the current component
      updatedComponents.push(component);

      // Add a divider after the component if needed
      if (shouldAddDivider && index < uniqueProductComponents.length - 1) {
        updatedComponents.push(Component.Divider);
      }
    });

    uniqueProductComponents = updatedComponents;
  }

  return uniqueProductComponents;
};
