import { AppScreens } from '../types/AppScreens';
import { AppState } from '../types/AppState';

export function pushHistory(screen: AppScreens, state: AppState): AppState {
  if (state.screen === screen) return state;

  return {
    ...state,
    screen,
    screenHistory: [...state.screenHistory, state.screen],
  };
}

export function replaceHistory(screen: AppScreens, state: AppState): AppState {
  if (state.screen === screen) return state;

  return {
    ...state,
    screen,
    screenHistory: [],
  };
}

export function canGoBack(state: AppState) {
  return state.screenHistory.length > 0;
}
