import { PartialDeep } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

import { AdminPortalStyleConfig } from '../../../adminPortal/AdminPortalStyleConfig';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';

export interface AdminPortalComponentProps<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Stytch B2B client to use.
   */
  client: StytchB2BClient<TProjectConfiguration>;

  /**
   * An HTML element or query selector string for the element that should contain the UI.
   * @example '#container'
   */
  element: string | HTMLElement;
  /**
   * An {@link AdminPortalStyleConfig} object containing custom styling info.
   */
  styles?: PartialDeep<AdminPortalStyleConfig>;
}

interface InjectedOptions<TProjectConfiguration extends StytchProjectConfigurationInput> {
  client: StytchB2BClient<TProjectConfiguration>;
  element: HTMLElement;
}

export type ExcludeInjectedOptions<T> = Omit<T, keyof InjectedOptions<StytchProjectConfigurationInput>>;
