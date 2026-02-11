import React from 'react';
import { usePasswordsAuthenticate } from '../hooks/usePasswordsAuthenticate';
import { PasswordAuthenticateScreen } from './PasswordAuthenticateScreen';
import { render, screen, /*fireEvent,*/ DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';
import { MOCK_ORGANIZATION } from '../mocks';

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
