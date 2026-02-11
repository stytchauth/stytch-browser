import { PartialDeep } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { AdminPortalStyleConfig } from '../AdminPortalStyleConfig';

export interface AdminPortalCommonProps<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Stytch B2B client to use.
   */
  client: StytchB2BClient<TProjectConfiguration>;

  /**
   * An {@link AdminPortalStyleConfig} object containing custom styling info.
   */
  styles?: PartialDeep<AdminPortalStyleConfig>;
}
