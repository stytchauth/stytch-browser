import { IconButton } from '@storybook/components';
import { STORY_RENDER_PHASE_CHANGED } from '@storybook/core-events';
import { TransferIcon } from '@storybook/icons';
import { useAddonState, useChannel, useGlobals } from '@storybook/manager-api';
import React, { useEffect, useState } from 'react';

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

  const [{ autoLocaleEnabled }, setAddonState] = useAddonState('locale-test-switcher', { autoLocaleEnabled: true });

  const toggleAutoLocale = () => {
    setAddonState((oldState) => ({ ...oldState, autoLocaleEnabled: !oldState.autoLocaleEnabled }));
  };

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

  return (
    <IconButton
      key="locale-test-switcher"
      title="Automatically switch locale when running play functions"
      onClick={toggleAutoLocale}
      active={autoLocaleEnabled}
    >
      <TransferIcon />
    </IconButton>
  );
};
