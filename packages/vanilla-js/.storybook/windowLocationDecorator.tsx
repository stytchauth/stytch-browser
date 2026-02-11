import React, { useEffect } from 'react';
import type { Decorator, StoryFn } from '@storybook/preact';

const WindowLocationMock = ({ children }: { children: ReturnType<StoryFn> }) => {
  useEffect(() => {
    window.__STORYBOOK_MOCK_LOCATION__ = {
      href: '',
    };

    return () => {
      delete window.__STORYBOOK_MOCK_LOCATION__;
    };
  }, []);

  return children as React.ReactNode;
};

export const windowLocationDecorator: Decorator = (Story, context) => {
  return <WindowLocationMock>{Story(context)}</WindowLocationMock>;
};
