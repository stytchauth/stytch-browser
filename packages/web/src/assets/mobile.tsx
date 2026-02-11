import React from 'react';

import { DEFAULT_ICON_SIZE, IconProps } from './types';

export const MobileIcon = ({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M16 1.5H8C6.62 1.5 5.5 2.62 5.5 4V21C5.5 22.38 6.62 23.5 8 23.5H16C17.38 23.5 18.5 22.38 18.5 21V4C18.5 2.62 17.38 1.5 16 1.5ZM12 22.5C11.17 22.5 10.5 21.83 10.5 21C10.5 20.17 11.17 19.5 12 19.5C12.83 19.5 13.5 20.17 13.5 21C13.5 21.83 12.83 22.5 12 22.5ZM16.5 18.5H7.5V4.5H16.5V18.5Z"
      fill="currentColor"
    />
  </svg>
);
