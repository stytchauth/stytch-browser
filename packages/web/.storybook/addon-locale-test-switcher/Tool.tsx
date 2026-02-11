import { useEffect, useState } from 'react';
import { STORY_RENDER_PHASE_CHANGED } from 'storybook/internal/core-events';
import { useAddonState, useChannel, useGlobals } from 'storybook/manager-api';

/**
 * Watch for story render phase changes to determine if the story is playing.
 */
const useIsStoryPlaying = () => {
  const [storyIsPlaying, setStoryIsPlaying] = useState(false);

  useChannel({
    [STORY_RENDER_PHASE_CHANGED]: (data) => {
      if (data.newPhase === 'playing') {
        setStoryIsPlaying(true);
      } else if (data.newPhase === 'played' || data.newPhase === 'errored') {
        setStoryIsPlaying(false);
      }
    },
  });

  return storyIsPlaying;
};

export const Tool = () => {
  const [localeToRestore, setLocaleToRestore] = useState<string>();

  const [{ autoLocaleEnabled }] = useAddonState('locale-test-switcher', { autoLocaleEnabled: true });

  const [, updateGlobals, storyGlobals, userGlobals] = useGlobals();

  const storyIsPlaying = useIsStoryPlaying();

  useEffect(() => {
    const restoreOldLocale = () => {
      if (localeToRestore) {
        updateGlobals({ locale: localeToRestore });
      }
      setLocaleToRestore(undefined);
    };

    if (!autoLocaleEnabled || !storyIsPlaying || storyGlobals.locale) {
      restoreOldLocale();
    } else if (storyIsPlaying) {
      // If the story is playing and the locale is not set to `en`, temporarily set it to `en`
      if (userGlobals.locale && userGlobals.locale !== 'en') {
        setLocaleToRestore((oldLocale) => oldLocale || userGlobals.locale);
        updateGlobals({ locale: 'en' });
      }
    }
  }, [storyIsPlaying, localeToRestore, autoLocaleEnabled, storyGlobals.locale, updateGlobals, userGlobals.locale]);

  return null;
};
