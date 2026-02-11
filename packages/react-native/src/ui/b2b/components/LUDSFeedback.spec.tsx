import React from 'react';
import { DEFAULT_RENDER_PROPS, ProviderProps, render, screen } from '../testUtils';
import { LUDSFeedback } from './LUDSFeedback';

describe('LUDSFeedback', () => {
  describe('Length check', () => {
    describe('When valid', () => {
      it('renders as expected', () => {
        render(DEFAULT_RENDER_PROPS)(<LUDSFeedback missingCharacters={0} missingComplexity={0} />);
        expect(screen.getByTestId('ValidLength')).toBeTruthy();
        expect(screen.queryByTestId('InvalidLength')).toBeFalsy();
      });
    });
    describe('When invalid', () => {
      it('renders as expected', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          bootstrapData: {
            ...DEFAULT_RENDER_PROPS.bootstrapData,
            passwordConfig: {
              ...DEFAULT_RENDER_PROPS.bootstrapData.passwordConfig,
              ludsMinimumCount: 5,
              ludsComplexity: 4,
            },
          },
        };
        render(props)(<LUDSFeedback missingCharacters={1} missingComplexity={0} />);
        expect(screen.queryByTestId('ValidLength')).toBeFalsy();
        expect(screen.getByTestId('InvalidLength')).toBeTruthy();
        expect(screen.getByText('Must be at least 5 characters long')).toBeTruthy();
      });
    });
  });
  describe('Complexity check', () => {
    describe('When valid', () => {
      it('renders as expected', () => {
        render(DEFAULT_RENDER_PROPS)(<LUDSFeedback missingCharacters={0} missingComplexity={0} />);
        expect(screen.getByTestId('ValidComplexity')).toBeTruthy();
        expect(screen.queryByTestId('InvalidComplexity')).toBeFalsy();
      });
    });
    describe('When invalid', () => {
      it('renders as expected', () => {
        const props: ProviderProps = {
          ...DEFAULT_RENDER_PROPS,
          bootstrapData: {
            ...DEFAULT_RENDER_PROPS.bootstrapData,
            passwordConfig: {
              ...DEFAULT_RENDER_PROPS.bootstrapData.passwordConfig,
              ludsMinimumCount: 5,
              ludsComplexity: 4,
            },
          },
        };
        render(props)(<LUDSFeedback missingCharacters={0} missingComplexity={1} />);
        expect(screen.queryByTestId('ValidComplexity')).toBeFalsy();
        expect(screen.getByTestId('InvalidComplexity')).toBeTruthy();
        expect(
          screen.getByText('Must contain 4 of the following: uppercase letter, lowercase letter, number, symbol'),
        ).toBeTruthy();
      });
    });
  });
});
