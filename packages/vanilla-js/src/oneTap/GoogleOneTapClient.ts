import type { accounts, CredentialResponse, IdConfiguration, PromptMomentNotification } from 'google-one-tap';
import { GOOGLE_ONE_TAP_HOST } from '@stytch/core';
import { OneTapStyleConfig } from '@stytch/core/public';
import { getConfiguredEmbeddedMode, getShouldRenderEmbeddedOneTap } from './positionModes';

type OneTapNotShownReason =
  | ReturnType<PromptMomentNotification['getNotDisplayedReason']>
  | ReturnType<PromptMomentNotification['getSkippedReason']>;

export type OneTapRenderResult = { success: true } | { success: false; reason: OneTapNotShownReason };

/**
 * Wrapper around Google One Tap JS client that combines initialize() and prompt()
 * into one async render() call
 *
 * @see https://developers.google.com/identity/gsi/web/guides/display-google-one-tap#javascript
 */
export class GoogleOneTapClient {
  constructor(
    private _googleClient: accounts['id'],
    private _clientId: string,
  ) {}

  cancel(): void {
    this._googleClient.cancel();
  }

  async render({
    callback,
    onOneTapCancelled,
    style,
    cancelOnTapOutside = true,
  }: {
    callback: (response: CredentialResponse) => void;
    onOneTapCancelled?: (showError?: boolean) => void;
    style: OneTapStyleConfig;
    cancelOnTapOutside?: boolean;
  }): Promise<OneTapRenderResult> {
    const embeddedMode = getConfiguredEmbeddedMode(style.position);
    const shouldRenderEmbeddedOneTap = getShouldRenderEmbeddedOneTap(style.position);

    const config: IdConfiguration = {
      client_id: this._clientId,
      callback: callback,
      auto_select: false,
      context: 'use',
      itp_support: true,
      use_fedcm_for_prompt: embeddedMode !== 'force',
      cancel_on_tap_outside: cancelOnTapOutside,
    };
    if (shouldRenderEmbeddedOneTap) {
      config.prompt_parent_id = 'google-parent-prompt';
      config.cancel_on_tap_outside = false;
    }
    this._googleClient.initialize(config);

    return new Promise((resolve) => {
      this._googleClient.prompt((notification: PromptMomentNotification) => {
        if (notification.isSkippedMoment()) {
          // After FedCM is mandatory, `getSkippedReason` will no longer be
          // supported, so access it defensively.
          const reason = notification.getSkippedReason?.() ?? 'unknown_reason';

          if (reason === 'user_cancel') {
            onOneTapCancelled?.();
          }
          return resolve({
            success: false,
            reason,
          });
        }

        // At some point after FedCM is mandatory, `isNotDisplayed` and
        // `getNotDisplayedReason` (and display moments in general) will not be
        // supported. If we can tell they're not available and we're trying to
        // show an embedded one tap UI, we should treat it as a failure, because
        // we won't expect an embedded UI to work (by virtue of FedCM being
        // mandatory) and won't expect any other notifications.
        if ((!notification.isNotDisplayed && shouldRenderEmbeddedOneTap) || notification.isNotDisplayed?.()) {
          return resolve({
            success: false,
            reason: notification.getNotDisplayedReason?.() ?? 'unknown_reason',
          });
        }

        if (!notification.isDismissedMoment()) {
          this.styleFrame(shouldRenderEmbeddedOneTap);
          return resolve({ success: true });
        }
      });
    });
  }

  styleFrame(shouldRenderEmbeddedOneTap: boolean) {
    if (!shouldRenderEmbeddedOneTap) {
      return;
    }
    Array.from(document.getElementsByTagName('iframe')).forEach((frame) => {
      if (frame.src.includes(GOOGLE_ONE_TAP_HOST)) {
        frame.style.width = '100%';
      }
    });
  }
}
