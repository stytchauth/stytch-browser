import { render } from '@testing-library/react';
import React from 'react';

import ErrorText from './ErrorText';

describe('ErrorText', () => {
  it('Can render a regular error', () => {
    const errorMessage = 'Invalid email, please try again.';

    const { container } = render(<ErrorText>{errorMessage}</ErrorText>);

    expect(container).toMatchInlineSnapshot(`
     <div>
       <div
         aria-live="polite"
       >
         <div
           class="typography helper destructive"
         >
           Invalid email, please try again.
         </div>
       </div>
     </div>
    `);
  });

  it('Can render a hyperlinked error to the stytch dashboard', () => {
    const errorMessage =
      '[400] bad_domain_for_stytch_sdk\n' +
      'This website has not been registered as an allowed domain for the Stytch SDK. Please add it here: https://stytch.com/dashboard/sdk-configuration\n' +
      'See https://stytch.com/dashboard/sdk-configuration for more information.';

    const { container } = render(<ErrorText>{errorMessage}</ErrorText>);

    expect(container).toMatchInlineSnapshot(`
     <div>
       <div
         aria-live="polite"
       >
         <div
           class="typography helper destructive"
         >
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
         </div>
       </div>
     </div>
    `);
  });

  it('Renders hash params', () => {
    const errorMessage = 'https://stytch.com/dashboard#this-is-a-hash link';

    const { container } = render(<ErrorText>{errorMessage}</ErrorText>);

    expect(container).toMatchInlineSnapshot(`
     <div>
       <div
         aria-live="polite"
       >
         <div
           class="typography helper destructive"
         >
           <a
             href="https://stytch.com/dashboard#this-is-a-hash"
             rel="noreferrer"
             target="_blank"
           >
             https://stytch.com/dashboard#this-is-a-hash
           </a>
            link
         </div>
       </div>
     </div>
    `);
  });

  it('Does not render links that do not go to the stytch dashboard', () => {
    const errorMessage = 'https://othersite.com cannot be found';

    const { container } = render(<ErrorText>{errorMessage}</ErrorText>);

    expect(container).toMatchInlineSnapshot(`
     <div>
       <div
         aria-live="polite"
       >
         <div
           class="typography helper destructive"
         >
           https://othersite.com cannot be found
         </div>
       </div>
     </div>
    `);
  });

  it('Does not render tricky-looking links that do not go to the stytch dashboard', () => {
    const errorMessage = 'https://stytch.com.evil.net cannot be found';

    const { container } = render(<ErrorText>{errorMessage}</ErrorText>);

    expect(container).toMatchInlineSnapshot(`
     <div>
       <div
         aria-live="polite"
       >
         <div
           class="typography helper destructive"
         >
           https://stytch.com.evil.net cannot be found
         </div>
       </div>
     </div>
    `);
  });
});
