import { BootstrapData } from '@stytch/core';

import { MOCK_BOOTSTRAP_DATA } from '../../../testUtils';
import { getNewPasswordProps } from './PasswordError';

describe('getNewPasswordProps', () => {
  it('returns default password props when policy is not loaded', () => {
    const result = getNewPasswordProps(MOCK_BOOTSTRAP_DATA, 'notLoaded');
    expect(result).toMatchInlineSnapshot(`
{
  "passwordrules": "allowed: unicode; minlength: 10",
  "type": "new",
}
`);
  });

  it('returns default password props for zxcvbn policy', () => {
    const result = getNewPasswordProps(MOCK_BOOTSTRAP_DATA, 'zxcvbn');
    expect(result).toMatchInlineSnapshot(`
{
  "passwordrules": "allowed: unicode; minlength: 10",
  "type": "new",
}
`);
  });

  it('returns default password props for luds policy when passwordConfig is null', () => {
    const bootstrap: BootstrapData = {
      ...MOCK_BOOTSTRAP_DATA,
      passwordConfig: null,
    };
    const result = getNewPasswordProps(bootstrap, 'luds');
    expect(result).toMatchInlineSnapshot(`
{
  "passwordrules": "allowed: unicode; minlength: 10",
  "type": "new",
}
`);
  });

  it('returns custom password props for luds policy with passwordConfig', () => {
    const bootstrap: BootstrapData = {
      ...MOCK_BOOTSTRAP_DATA,
      passwordConfig: {
        ludsComplexity: 2,
        ludsMinimumCount: 12,
      },
    };
    const result = getNewPasswordProps(bootstrap, 'luds');
    expect(result).toMatchInlineSnapshot(`
{
  "minLength": 12,
  "passwordrules": "allowed: unicode; minlength: 12; required: special; required: digit",
  "type": "new",
}
`);
  });

  it('returns correct password props for luds policy with all complexity requirements', () => {
    const bootstrap: BootstrapData = {
      ...MOCK_BOOTSTRAP_DATA,
      passwordConfig: {
        ludsComplexity: 4,
        ludsMinimumCount: 8,
      },
    };
    const result = getNewPasswordProps(bootstrap, 'luds');
    expect(result).toMatchInlineSnapshot(`
{
  "minLength": 8,
  "passwordrules": "allowed: unicode; minlength: 8; required: special; required: digit; required: upper; required: lower",
  "type": "new",
}
`);
  });
});
