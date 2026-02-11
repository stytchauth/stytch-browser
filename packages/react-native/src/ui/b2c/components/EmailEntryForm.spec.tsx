import React from 'react';

import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen } from '../testUtils';
import { EMAIL_ADDRESS_PLACEHOLDER, EmailEntryForm } from './EmailEntryForm';

describe('EmailEntryForm', () => {
  describe('Default', () => {
    it('renders as expected', () => {
      render(DEFAULT_RENDER_PROPS)(<EmailEntryForm />);
      expect(screen.getByPlaceholderText(EMAIL_ADDRESS_PLACEHOLDER)).toBeTruthy();
      expect(screen.queryByTestId('FormFieldError')).toBeFalsy();
      expect(screen.queryByTestId('StytchButton')).toBeFalsy();
    });
  });
  describe('With button enabled', () => {
    it('renders as expected', () => {
      render(DEFAULT_RENDER_PROPS)(<EmailEntryForm onValidEmailEntered={jest.fn()} />);
      expect(screen.getByPlaceholderText(EMAIL_ADDRESS_PLACEHOLDER)).toBeTruthy();
      expect(screen.queryByTestId('FormFieldError')).toBeFalsy();
      expect(screen.getByTestId('StytchButton')).toBeTruthy();
    });
  });
  describe('With an email error', () => {
    it('renders as expected', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            userState: {
              ...DEFAULT_RENDER_PROPS.state[0].userState,
              emailAddress: {
                emailAddress: 'bademailaddress',
                isValid: false,
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(<EmailEntryForm onValidEmailEntered={jest.fn()} />);
      expect(screen.getByTestId('FormFieldError')).toBeTruthy();
    });
  });
});
