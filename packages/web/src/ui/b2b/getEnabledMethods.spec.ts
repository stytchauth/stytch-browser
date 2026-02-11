import { getEnabledMethods } from './getEnabledMethods';

describe('getEnabledMethods', () => {
  const allMethods = ['emailMagicLinks', 'oauth', 'passwords', 'sso'];

  it('returns all methods if org-restricted methods is empty', () => {
    const orgSupportedMethods: string[] = [];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods,
      uiIncludedMethods: undefined,
    });
    expect(Array.from(result)).toEqual(allMethods);
  });

  it('returns org-restricted methods if provided', () => {
    const orgSupportedMethods = ['emailMagicLinks', 'oauth'];
    const uiIncludedMethods = ['oauth', 'passwords'];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods,
      uiIncludedMethods,
    });
    expect(Array.from(result)).toEqual(orgSupportedMethods);
  });

  it('returns methods included by UI config if no other restrictions are specified', () => {
    const uiIncludedMethods = ['oauth', 'passwords'];
    const result = getEnabledMethods({
      allMethods,
      orgSupportedMethods: [],
      uiIncludedMethods,
    });
    expect(Array.from(result)).toEqual(uiIncludedMethods);
  });
});
