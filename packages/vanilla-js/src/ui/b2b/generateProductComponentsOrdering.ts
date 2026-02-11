import { StringLiteralFromEnum } from '@stytch/core';
import { AuthFlowType, B2BProducts } from '@stytch/core/public';
import { FlowState } from './types/AppState';
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

export const isButtonsComponent = (component: Component): component is Component.OAuthButtons | Component.SSOButtons =>
  component === Component.OAuthButtons || component === Component.SSOButtons;

/*
  Here we are generating the ordering and which components will be displayed.
  We use the Component enum this because there is some complex logic here, and
  we want to be able to unit test.

  Rules we want to follow when generating the components:
  1. If we're displaying both an email-based method (email magic links and/or email OTPs) and passwords,
  we need to display them together as a single wrapped component. The index of this wrapped component is
  equivalent to the first index of either email-based method or passwords in the config products list.
  2. If we have both buttons and input, we want to display a divider between the last 2 elements.
  3. Some components have both a discovery and a non-discovery version. We want to display the correct version
  based on the flow type (found in state).
  4. We want to display the components in the order that they are listed in the config.

  This function should be considered the source of truth for which components to render
  and what order to render them in as of 6/21/23.
*/
export const generateProductComponentsOrdering = (
  products: StringLiteralFromEnum<B2BProducts>[],
  flowState: FlowState,
): Component[][] => {
  const flowStateType = flowState.type;
  const productsSet = new Set(products);
  const displayEmailAndPasswordsTogether =
    (productsSet.has(B2BProducts.emailMagicLinks) || productsSet.has(B2BProducts.emailOtp)) &&
    productsSet.has(B2BProducts.passwords);
  const emailPasswordCombinedComponent =
    flowStateType === AuthFlowType.Organization
      ? Component.PasswordEmailCombined
      : Component.PasswordEmailCombinedDiscovery;

  const productComponentsSet = products.reduce((components, product) => {
    switch (product) {
      case B2BProducts.emailMagicLinks:
      case B2BProducts.emailOtp:
        if (displayEmailAndPasswordsTogether) {
          components.add(emailPasswordCombinedComponent);
        } else {
          components.add(
            flowStateType === AuthFlowType.Organization ? Component.EmailForm : Component.EmailDiscoveryForm,
          );
        }
        break;
      case B2BProducts.oauth:
        components.add(Component.OAuthButtons);
        break;
      case B2BProducts.sso: {
        const isSsoValid =
          flowStateType === AuthFlowType.Discovery ||
          (flowStateType === AuthFlowType.Organization &&
            (flowState.organization?.sso_active_connections?.length ?? 0) > 0);
        if (isSsoValid) {
          components.add(Component.SSOButtons);
        }
        break;
      }
      case B2BProducts.passwords:
        components.add(
          displayEmailAndPasswordsTogether ? emailPasswordCombinedComponent : Component.PasswordsEmailForm,
        );
        break;
    }
    return components;
  }, new Set<Component>());

  return Array.from(productComponentsSet).reduce<Component[][]>((groups, component, i, arr) => {
    const prevComponent = i > 0 ? arr[i - 1] : undefined;

    // Group consecutive components with buttons
    const shouldJoinPreviousGroup = prevComponent && isButtonsComponent(component) && isButtonsComponent(prevComponent);

    if (shouldJoinPreviousGroup) {
      groups[groups.length - 1].push(component);
    } else {
      // If the previous group was a different type than this group, prepend a divider
      const prevGroup = groups.length > 0 ? groups[groups.length - 1] : undefined;
      if (prevGroup && isButtonsComponent(prevGroup[0]) !== isButtonsComponent(component)) {
        groups.push([Component.Divider]);
      }

      groups.push([component]);
    }
    return groups;
  }, []);
};
