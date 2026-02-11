import { AuthFlowType } from '@stytch/core/public';

import { StytchB2BProduct } from './StytchB2BProduct';
import { ButtonComponent, MainScreenComponent } from './types/AppScreens';
import { FlowState } from './types/AppState';

export const isButtonsComponent = (component: MainScreenComponent): component is ButtonComponent =>
  component === MainScreenComponent.OAuthButtons || component === MainScreenComponent.SSOButtons;

/*
  Here we are generating the ordering and which components will be displayed.
  We use the MainScreenComponent enum this because there is some complex logic here, and
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
  products: StytchB2BProduct[],
  flowState: FlowState,
): MainScreenComponent[][] => {
  const flowStateType = flowState.type;
  const productsSet = new Set(products.map((p) => p.id));
  const displayEmailAndPasswordsTogether =
    (productsSet.has('emailMagicLinks') || productsSet.has('emailOtp')) && productsSet.has('passwords');
  const emailPasswordCombinedComponent =
    flowStateType === AuthFlowType.Organization
      ? MainScreenComponent.PasswordEmailCombined
      : MainScreenComponent.PasswordEmailCombinedDiscovery;

  const productComponentsSet = products.reduce((components, product) => {
    switch (product.id) {
      case 'emailMagicLinks':
      case 'emailOtp':
        if (displayEmailAndPasswordsTogether) {
          components.add(emailPasswordCombinedComponent);
        } else {
          components.add(
            flowStateType === AuthFlowType.Organization
              ? MainScreenComponent.EmailForm
              : MainScreenComponent.EmailDiscoveryForm,
          );
        }
        break;
      case 'oauth':
        components.add(MainScreenComponent.OAuthButtons);
        break;
      case 'sso': {
        const isSsoValid =
          flowStateType === AuthFlowType.Discovery ||
          (flowStateType === AuthFlowType.Organization &&
            (flowState.organization?.sso_active_connections?.length ?? 0) > 0);
        if (isSsoValid) {
          components.add(MainScreenComponent.SSOButtons);
        }
        break;
      }
      case 'passwords':
        components.add(
          displayEmailAndPasswordsTogether ? emailPasswordCombinedComponent : MainScreenComponent.PasswordsEmailForm,
        );
        break;
    }
    return components;
  }, new Set<MainScreenComponent>());

  return Array.from(productComponentsSet).reduce<MainScreenComponent[][]>((groups, component, i, arr) => {
    const prevComponent = i > 0 ? arr[i - 1] : undefined;

    // Group consecutive components with buttons
    const shouldJoinPreviousGroup = prevComponent && isButtonsComponent(component) && isButtonsComponent(prevComponent);

    if (shouldJoinPreviousGroup) {
      groups[groups.length - 1].push(component);
    } else {
      // If the previous group was a different type than this group, prepend a divider
      const prevGroup = groups.length > 0 ? groups[groups.length - 1] : undefined;
      if (prevGroup && isButtonsComponent(prevGroup[0]) !== isButtonsComponent(component)) {
        groups.push([MainScreenComponent.Divider]);
      }

      groups.push([component]);
    }
    return groups;
  }, []);
};
