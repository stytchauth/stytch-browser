import React from 'react';

import { DEFAULT_ICON_SIZE, IconProps } from './types';

export const SSOIcon = ({ size = DEFAULT_ICON_SIZE, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_221_1596)">
      <path
        d="M17.5125 10.53C17.0025 7.9425 14.73 6 12 6C9.8325 6 7.95 7.23 7.0125 9.03C4.755 9.27 3 11.1825 3 13.5C3 15.9825 5.0175 18 7.5 18H17.25C19.32 18 21 16.32 21 14.25C21 12.27 19.4625 10.665 17.5125 10.53Z"
        fill="currentColor"
      />
    </g>
    <g clipPath="url(#clip1_221_1596)">
      <path
        d="M15.9684 13.1139L14.9987 14.0933L14.5152 13.6098L14.2501 13.3446L13.9849 13.6098L13.5001 14.0946L13.0152 13.6098L12.9054 13.4999H12.7501H12.6188H12.3532L12.2651 13.7504C12.0087 14.4788 11.3147 14.9999 10.5001 14.9999C9.46592 14.9999 8.62506 14.1591 8.62506 13.1249C8.62506 12.0908 9.46592 11.2499 10.5001 11.2499C11.3147 11.2499 12.0087 11.7711 12.2651 12.4994L12.3532 12.7499H12.6188H15.5969L15.9684 13.1139ZM9.00006 13.1249C9.00006 13.9508 9.6742 14.6249 10.5001 14.6249C11.3259 14.6249 12.0001 13.9508 12.0001 13.1249C12.0001 12.2991 11.3259 11.6249 10.5001 11.6249C9.6742 11.6249 9.00006 12.2991 9.00006 13.1249Z"
        fill="var(--st-background)"
        stroke="var(--st-background)"
        strokeWidth="0.75"
      />
    </g>
    <defs>
      <clipPath id="clip0_221_1596">
        <rect width="18" height="18" transform="translate(3 3)" />
      </clipPath>
      <clipPath id="clip1_221_1596">
        <rect width="8.25" height="6" transform="translate(8.25006 10.1251)" />
      </clipPath>
    </defs>
  </svg>
);
