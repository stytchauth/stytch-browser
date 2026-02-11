import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { StytchB2BProvider } from '@stytch/react/b2b';

const mockStytch = {
  session: {
    onChange: () => () => null,
    getSync: () => null,
    getInfo: () => ({}),
  },
  self: {
    onChange: () => () => null,
    getSync: () => null,
    getInfo: () => ({}),
  },
  organization: {
    onChange: () => () => null,
    getSync: () => null,
    getInfo: () => ({}),
  },
  rbac: {
    isAuthorizedSync: () => false,
    isAuthorized: () => Promise.resolve(false),
  },
  onStateChange: () => () => null,
  parseAuthenticateUrl: () => null,
};

describe('App', () => {
  it('Renders without crashing', () => {
    render(
      <StytchB2BProvider stytch={mockStytch}>
        <App />
      </StytchB2BProvider>,
    );
    expect(screen.getByText('B2B SDK Workbench')).toBeDefined();
  });
});
