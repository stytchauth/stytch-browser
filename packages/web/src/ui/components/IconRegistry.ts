import { ComponentType } from 'react';

import type { IconProps } from '../../assets/types';

/**
 * Usage note: This is not type-safe if you use string as T, you have to constrain T to the icon key, e.g.
 * const iconRegistry: IconRegistry<keyof typeof oauthIcons> = usePresentation().iconRegistry;
 **/
export type IconRegistry<T extends string> = Record<T, ComponentType<IconProps>>;
