import type { HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<unknown> {
  size?: number;
}

/**
 * Default icon size in pixels
 */
export const DEFAULT_ICON_SIZE = 20;
