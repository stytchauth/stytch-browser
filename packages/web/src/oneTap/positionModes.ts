import { OneTapPositions } from '@stytch/core/public';

import { navigatorSupportsFedCM } from './navigatorSupportsFedCM';

export const getConfiguredEmbeddedMode = (position: OneTapPositions | undefined) => {
  if (position === OneTapPositions.forceLegacyEmbedded) {
    return 'force';
  }

  if (
    position === OneTapPositions.embeddedOnly ||
    position === OneTapPositions.embedded ||
    position === OneTapPositions.floatingOrEmbedded
  ) {
    return true;
  }

  return false;
};

export const getShouldRenderEmbeddedOneTap = (position: OneTapPositions | undefined) => {
  // Attempt embedded positioning if some embedded mode has been requested, and
  // either:
  // - the browser does not support FedCM (in which case embedded positioning
  //   could work), or
  // - the developer has specified legacy embedded positioning (in which case
  //   embedded positioning may not be honored)

  const embeddedMode = getConfiguredEmbeddedMode(position);
  return embeddedMode === 'force' || (embeddedMode && !navigatorSupportsFedCM);
};

export const getShouldRenderFloatingOneTap = (position: OneTapPositions | undefined) => {
  // Use floating positioning if we aren't using embedded positioning and the
  // developer hasn't specifically requested not to use floating positioning
  return position !== OneTapPositions.embeddedOnly && !getShouldRenderEmbeddedOneTap(position);
};

export const getRenderedOneTapMode = (position: OneTapPositions | undefined) => {
  const embeddedMode = getConfiguredEmbeddedMode(position);

  if (embeddedMode === 'force' || (embeddedMode && !navigatorSupportsFedCM)) {
    return 'embedded';
  }

  if (position !== OneTapPositions.embeddedOnly) {
    return 'floating';
  }

  return false;
};
