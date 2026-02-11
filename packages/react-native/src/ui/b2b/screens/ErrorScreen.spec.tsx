import React from 'react';
import { ErrorScreen } from './ErrorScreen';
import { render, screen, DEFAULT_RENDER_PROPS, ProviderProps } from '../testUtils';
import { B2BErrorType } from '../../shared/types';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('ErrorScreen', () => {
  describe('With a missing error', () => {
    it('renders nothing', () => {
      const view: ProviderProps = DEFAULT_RENDER_PROPS;
      render(view)(<ErrorScreen />);
      expect(screen.queryByTestId(`ErrorScreen`)).toBeFalsy();
    });
  });
  describe('With a non-internal error', () => {
    it('renders nothing', () => {
      const view: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: { apiError: MOCK_STYTCH_API_ERROR },
            },
          },
          jest.fn(),
        ],
      };
      render(view)(<ErrorScreen />);
      expect(screen.queryByTestId(`ErrorScreen`)).toBeFalsy();
    });
  });
  describe('With an internal error of the wrong type', () => {
    it('renders nothing', () => {
      const view: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: { internalError: 'Something done went wrong' },
            },
          },
          jest.fn(),
        ],
      };
      render(view)(<ErrorScreen />);
      expect(screen.queryByTestId(`ErrorScreen`)).toBeFalsy();
    });
  });
  describe('With an internal error of the correct type', () => {
    it('renders correctly', () => {
      const view: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: { internalError: B2BErrorType.Default },
            },
          },
          jest.fn(),
        ],
      };
      render(view)(<ErrorScreen />);
      expect(screen.getByTestId(`ErrorScreen`)).toBeTruthy();
    });
  });
});
