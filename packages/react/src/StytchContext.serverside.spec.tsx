/**
 * @jest-environment node
 */

import React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { expectToThrow } from '@stytch/internal-test-utils';
import { StytchProvider } from './StytchContext';

const mockStytchClient = {} as any;

describe('StytchContext', () => {
  it('expect error when in a serverside environment and assumeHydrated is default true', async () => {
    expectToThrow(
      () => ReactDOMServer.renderToString(<StytchProvider stytch={mockStytchClient} />),
      'The `assumeHydrated` prop must be set to `false` when using StytchProvider in a server environment.',
    );
  });

  it('does not throw when rendering in a serverside environment and assumeHydrated is false', async () => {
    expect(() =>
      ReactDOMServer.renderToString(<StytchProvider stytch={mockStytchClient} assumeHydrated={false} />),
    ).not.toThrow();
  });

  it('Renders nothing initially - and in SSR environments when assumeHydrated is false', async () => {
    expect(
      ReactDOMServer.renderToString(<StytchProvider stytch={mockStytchClient} assumeHydrated={false} />),
    ).toMatchInlineSnapshot(`""`);
  });
});
