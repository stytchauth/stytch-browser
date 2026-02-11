import React from 'react';

import { usePasswordsAuthenticate } from '../hooks/usePasswordsAuthenticate';
import { MOCK_ORGANIZATION } from '../mocks';
import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen /*fireEvent,*/ } from '../testUtils';
import { PasswordAuthenticateScreen } from './PasswordAuthenticateScreen';

jest.mock('../hooks/usePasswordsAuthenticate');
const usePasswordsAuthenticateMock = jest.mocked(usePasswordsAuthenticate);

describe('PasswordAuthenticateScreen', () => {
  beforeAll(() => {
    usePasswordsAuthenticateMock.mockReturnValue({
      passwordsAuthenticate: jest.fn(),
    });
  });
  it('Renders with correct content', () => {
    const props: ProviderProps = {
      ...DEFAULT_RENDER_PROPS,
      state: [
        {
          ...DEFAULT_RENDER_PROPS.state[0],
          authenticationState: {
            ...DEFAULT_RENDER_PROPS.state[0].authenticationState,
            organization: MOCK_ORGANIZATION,
          },
        },
        DEFAULT_RENDER_PROPS.state[1],
      ],
    };
    render(props)(<PasswordAuthenticateScreen />);
    expect(screen.getByText('Log in with email and password')).toBeTruthy();
  });
});
