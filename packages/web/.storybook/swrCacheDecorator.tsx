import type { Decorator } from '@storybook/react-vite';
import React from 'react';
import { SWRConfig } from 'swr';

export const swrCacheDecorator: Decorator = (storyFn, context) => {
  return <SWRConfig value={{ provider: () => new Map() }}>{storyFn(context) as React.ReactNode}</SWRConfig>;
};
