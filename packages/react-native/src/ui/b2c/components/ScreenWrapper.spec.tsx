import { MissingPKCEError, StytchAPIError } from '@stytch/core/public';
import React from 'react';
import { View } from 'react-native';

import { Screen } from '../screens';
import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen } from '../testUtils';
import { ScreenWrapper } from './ScreenWrapper';

describe('ScreenWrapper', () => {
  describe('Back button', () => {
    it('Does not show on MainScreen', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.Main,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.queryByTestId('BackButton')).toBeFalsy();
    });
    it('Does not show on SuccessScreen', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.Success,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.queryByTestId('BackButton')).toBeFalsy();
    });
    it('Does show on other screens', () => {
      let props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.EMLConfirmation,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.NewUser,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.ReturningUser,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.OTPConfirmation,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.PasswordResetSent,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
      props = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screen: Screen.SetPassword,
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('BackButton')).toBeTruthy();
    });
  });
  describe('Watermark', () => {
    it("doesn't show when hidden", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        bootstrapData: {
          ...DEFAULT_RENDER_PROPS.bootstrapData,
          displayWatermark: false,
        },
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.queryByTestId('watermark')).toBeFalsy();
    });
    it('does show when not hidden', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        bootstrapData: {
          ...DEFAULT_RENDER_PROPS.bootstrapData,
          displayWatermark: true,
        },
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('watermark')).toBeTruthy();
    });
  });
  describe('ErrorResponseComponent', () => {
    it('shows when there is an internalerror', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: { internalError: 'This is a test error' },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('ErrorResponseComponent')).toBeTruthy();
      expect(screen.getByText('This is a test error')).toBeTruthy();
    });
    it('shows when there is an SDK error', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: { sdkError: new MissingPKCEError() },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('ErrorResponseComponent')).toBeTruthy();
      expect(screen.getByText('MissingPKCEError', { exact: false })).toBeTruthy();
    });
    it('shows when there is an API error', () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: {
                apiError: new StytchAPIError({
                  status_code: 400,
                  error_message: 'This is an API error message',
                  error_type: 'TestError',
                  error_url: 'https://stytch.com/docs/something',
                }),
              },
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.getByTestId('ErrorResponseComponent')).toBeTruthy();
      expect(screen.getByText('This is an API error message', { exact: false })).toBeTruthy();
    });
    it("doesn't show when there is an error with no message", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: {},
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.queryByTestId('ErrorResponseComponent')).toBeFalsy();
    });
    it("doesn't show when there is no error", () => {
      const props: ProviderProps = {
        ...DEFAULT_RENDER_PROPS,
        state: [
          {
            ...DEFAULT_RENDER_PROPS.state[0],
            screenState: {
              ...DEFAULT_RENDER_PROPS.state[0].screenState,
              error: undefined,
            },
          },
          DEFAULT_RENDER_PROPS.state[1],
        ],
      };
      render(props)(
        <ScreenWrapper testID="test">
          <></>
        </ScreenWrapper>,
      );
      expect(screen.queryByTestId('ErrorResponseComponent')).toBeFalsy();
    });
  });
  it('Renders its children', () => {
    render(DEFAULT_RENDER_PROPS)(
      <ScreenWrapper testID="test">
        <View testID="my-test-id"></View>
      </ScreenWrapper>,
    );
    expect(screen.getByTestId('my-test-id')).toBeTruthy();
  });
});
