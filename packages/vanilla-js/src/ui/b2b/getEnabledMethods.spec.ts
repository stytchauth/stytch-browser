import { B2BProducts } from '@stytch/core/public';
import { getEnabledMethods } from './getEnabledMethods';

describe('getEnabledMethods', () => {
  const allMethods: B2BProducts[] = [
    B2BProducts.emailMagicLinks,
    B2BProducts.oauth,
    B2BProducts.passwords,
    B2BProducts.sso,
  ];

  it('returns all methods if org-restricted methods is empty', () => {
    const orgSupportedMethods: B2BProducts[] = [];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods,
      uiIncludedMethods: undefined,
    });
    expect(Array.from(result)).toEqual(allMethods);
  });

  it('returns org-restricted methods if provided', () => {
    const orgSupportedMethods = [B2BProducts.emailMagicLinks, B2BProducts.oauth];
    const uiIncludedMethods = [B2BProducts.oauth, B2BProducts.passwords];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods,
      uiIncludedMethods,
    });
    expect(Array.from(result)).toEqual(orgSupportedMethods);
  });

  it('returns methods included by UI config if no other restrictions are specified', () => {
    const uiIncludedMethods = [B2BProducts.oauth, B2BProducts.passwords];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods: [],
      uiIncludedMethods,
    });
    expect(Array.from(result)).toEqual(uiIncludedMethods);
  });
});
