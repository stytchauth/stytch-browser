import * as ContextProvider from '../ContextProvider';
import { useFonts } from './useFonts';
import { Platform } from '../../../native-module/types';

describe('useFonts', () => {
  it('returns the original font name for non-iOS platforms', () => {
    jest.spyOn(ContextProvider, 'usePlatform').mockImplementation(() => {
      return Platform.Android;
    });
    const { getFontFor } = useFonts();
    const originalFontName = 'My_Font';
    const returnedFontName = getFontFor(originalFontName);
    expect(returnedFontName).toEqual(originalFontName);
  });
  it('returns the corrected font name for iOS platforms', () => {
    jest.spyOn(ContextProvider, 'usePlatform').mockImplementation(() => {
      return Platform.iOS;
    });
    const { getFontFor } = useFonts();
    const originalFontName = 'My_Font';
    const expectedFontName = 'My-Font';
    const returnedFontName = getFontFor(originalFontName);
    expect(returnedFontName).toEqual(expectedFontName);
  });
});
