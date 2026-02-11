import { RNUIProducts } from '@stytch/core/public';
import { generateProductComponentsOrdering, ProductComponent } from './generateB2CProductComponentsOrdering';

describe('generateB2CProductComponentsOrdering', () => {
  it('all components oauth first', () => {
    const products = [RNUIProducts.oauth, RNUIProducts.passwords, RNUIProducts.emailMagicLinks, RNUIProducts.otp];
    const expectedComponents = [
      ProductComponent.OAuthButtons,
      ProductComponent.Divider,
      ProductComponent.TabComponent,
      ProductComponent.EmailEntryForm,
    ];

    const result = generateProductComponentsOrdering(products, true, 'Email');

    expect(result).toEqual(expectedComponents);
  });

  it('all components input first', () => {
    const products = [RNUIProducts.passwords, RNUIProducts.emailMagicLinks, RNUIProducts.otp, RNUIProducts.oauth];
    const expectedComponents = [
      ProductComponent.TabComponent,
      ProductComponent.EmailEntryForm,
      ProductComponent.Divider,
      ProductComponent.OAuthButtons,
    ];

    const result = generateProductComponentsOrdering(products, true, 'Email');

    expect(result).toEqual(expectedComponents);
  });

  it('oauth first and eml no tabs', () => {
    const products = [RNUIProducts.oauth, RNUIProducts.emailMagicLinks];
    const expectedComponents = [
      ProductComponent.OAuthButtons,
      ProductComponent.Divider,
      ProductComponent.EmailEntryForm,
    ];

    const result = generateProductComponentsOrdering(products, false, 'Email');

    expect(result).toEqual(expectedComponents);
  });

  it('eml first and oauth no tabs', () => {
    const products = [RNUIProducts.emailMagicLinks, RNUIProducts.oauth];
    const expectedComponents = [
      ProductComponent.EmailEntryForm,
      ProductComponent.Divider,
      ProductComponent.OAuthButtons,
    ];

    const result = generateProductComponentsOrdering(products, false, 'Email');

    expect(result).toEqual(expectedComponents);
  });
});
