import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { StytchProvider } from '@stytch/react';

const mockStytch = {
  session: {
    onChange: () => () => null,
    getSync: () => null,
    getInfo: () => ({}),
  },
  user: {
    onChange: () => () => null,
    getSync: () => null,
    getInfo: () => ({}),
  },
  onStateChange: () => () => null,
  parseAuthenticateUrl: () => null,
};

describe('App', () => {
  it('Renders without crashing', () => {
    render(
      <StytchProvider stytch={mockStytch}>
        <App />
      </StytchProvider>,
    );
    expect(screen.getByText('SDK Workbench')).toBeDefined();
  });
});
