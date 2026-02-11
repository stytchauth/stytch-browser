import React from 'react';

import { DEFAULT_ICON_SIZE, IconProps } from './types';

export const Chevron = ({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9.09 7.91L13.67 12.5L9.09 17.09L10.5 18.5L16.5 12.5L10.5 6.5L9.09 7.91Z" fill="currentColor" />
    </svg>
  );
};
