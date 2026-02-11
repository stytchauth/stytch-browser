import React from 'react';
import { render } from '@testing-library/preact';
import { ErrorText } from './ErrorText';

// The Text component uses styled-components and expects a theme
// So it's easier to mock out
jest.mock('./Text', () => ({
  Text: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ErrorText', () => {
  it('Can render a regular error', () => {
    const errorMessage = 'Invalid email, please try again.';

    const { asFragment } = render(<ErrorText errorMessage={errorMessage} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        Invalid email, please try again.
      </DocumentFragment>
    `);
  });

  it('Can render a hyperlinked error to the stytch dashboard', () => {
    const errorMessage =
      '[400] bad_domain_for_stytch_sdk\n' +
      'This website has not been registered as an allowed domain for the Stytch SDK. Please add it here: https://stytch.com/dashboard/sdk-configuration\n' +
      'See https://stytch.com/dashboard/sdk-configuration for more information.';

    const { asFragment } = render(<ErrorText errorMessage={errorMessage} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        [400] bad_domain_for_stytch_sdk
      This website has not been registered as an allowed domain for the Stytch SDK. Please add it here: 
        <a
          href="https://stytch.com/dashboard/sdk-configuration"
          rel="noreferrer"
          target="_blank"
        >
          https://stytch.com/dashboard/sdk-configuration
        </a>
        
      See 
        <a
          href="https://stytch.com/dashboard/sdk-configuration"
          rel="noreferrer"
          target="_blank"
        >
          https://stytch.com/dashboard/sdk-configuration
        </a>
         for more information.
      </DocumentFragment>
    `);
  });

  it('Renders hash params', () => {
    const errorMessage = 'https://stytch.com/dashboard#this-is-a-hash link';

    const { asFragment } = render(<ErrorText errorMessage={errorMessage} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          href="https://stytch.com/dashboard#this-is-a-hash"
          rel="noreferrer"
          target="_blank"
        >
          https://stytch.com/dashboard#this-is-a-hash
        </a>
         link
      </DocumentFragment>
      `);
  });

  it('Does not render links that do not go to the stytch dashboard', () => {
    const errorMessage = 'https://othersite.com cannot be found';

    const { asFragment } = render(<ErrorText errorMessage={errorMessage} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        https://othersite.com cannot be found
      </DocumentFragment>
    `);
  });

  it('Does not render tricky-looking links that do not go to the stytch dashboard', () => {
    const errorMessage = 'https://stytch.com.evil.net cannot be found';

    const { asFragment } = render(<ErrorText errorMessage={errorMessage} />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        https://stytch.com.evil.net cannot be found
      </DocumentFragment>
    `);
  });
});
