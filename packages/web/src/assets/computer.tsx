import React from 'react';

import { DEFAULT_ICON_SIZE, IconProps } from './types';

export const ComputerIcon = ({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M20 18.5C21.1 18.5 21.99 17.6 21.99 16.5L22 6.5C22 5.4 21.1 4.5 20 4.5H4C2.9 4.5 2 5.4 2 6.5V16.5C2 17.6 2.9 18.5 4 18.5H0V20.5H24V18.5H20ZM4 6.5H20V16.5H4V6.5Z"
      fill="currentColor"
    />
  </svg>
);
