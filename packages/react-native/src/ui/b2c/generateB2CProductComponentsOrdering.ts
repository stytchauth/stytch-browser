import { RNUIProducts } from '@stytch/core/public';

export enum ProductComponent {
  OAuthButtons = 'OAuthButtons',
  TabComponent = 'TabComponent',
  EmailEntryForm = 'EmailEntryForm',
  PhoneEntryFormText = 'PhoneEntryFormText',
  PhoneEntryFormWhatsApp = 'PhoneEntryFormWhatsApp',
  Divider = 'Divider',
}

export const generateProductComponentsOrdering = (
  products: RNUIProducts[],
  usesTabComponent: boolean,
  selectedTabIndexString: string,
): ProductComponent[] => {
  const hasInput =
    products.includes(RNUIProducts.otp) ||
    products.includes(RNUIProducts.emailMagicLinks) ||
    products.includes(RNUIProducts.passwords);
  const hasOauth = products.includes(RNUIProducts.oauth);
  const hasDivider = hasOauth && hasInput;

  let hasAddedInputComponent = false;
  const productComponents = products
    .map((product) => {
      switch (product) {
        case RNUIProducts.emailMagicLinks:
        case RNUIProducts.otp:
        case RNUIProducts.passwords:
          if (hasAddedInputComponent === true && hasInput) {
            return undefined;
            break;
          }

          // Returns the appropriate ProductComponent based on whether tabs are used.
          // If `usesTabComponent` is true, `TabComponent` is returned, and the correct entry form is added separately.
          // Otherwise, selects the corresponding entry form based on `selectedTabIndexString`.
          // Defaults to `undefined` if no match is found.
          hasAddedInputComponent = true;

          if (usesTabComponent) {
            return ProductComponent.TabComponent;
          } else if (selectedTabIndexString === 'Email') {
            return ProductComponent.EmailEntryForm;
          } else if (selectedTabIndexString === 'Text') {
            return ProductComponent.PhoneEntryFormText;
          } else if (selectedTabIndexString === 'WhatsApp') {
            return ProductComponent.PhoneEntryFormWhatsApp;
          } else {
            return undefined;
          }
          break;
        case RNUIProducts.oauth:
          return ProductComponent.OAuthButtons;
          break;
        default:
          return undefined;
          break;
      }
    })
    .filter((component) => component !== undefined) as ProductComponent[];

  // If tabs are used, insert the appropriate entry form after the TabComponent.
  const tabIndex = productComponents.indexOf(ProductComponent.TabComponent);
  if (tabIndex !== -1) {
    if (selectedTabIndexString === 'Email') {
      productComponents.splice(tabIndex + 1, 0, ProductComponent.EmailEntryForm);
    } else if (selectedTabIndexString === 'Text') {
      productComponents.splice(tabIndex + 1, 0, ProductComponent.PhoneEntryFormText);
    } else if (selectedTabIndexString === 'WhatsApp') {
      productComponents.splice(tabIndex + 1, 0, ProductComponent.PhoneEntryFormWhatsApp);
    }
  }

  if (hasDivider) {
    if (productComponents[0] === ProductComponent.TabComponent) {
      productComponents.splice(2, 0, ProductComponent.Divider);
    } else {
      productComponents.splice(1, 0, ProductComponent.Divider);
    }
  }

  return productComponents;
};
