import type { AdminPortalStyleConfig } from '@stytch/vanilla-js/b2b/adminPortal';
import type { StytchB2BHeadlessClient, StytchProjectConfigurationInput } from '@stytch/vanilla-js/b2b/headless';
import React, { useRef } from 'react';
import { PartialDeep } from 'type-fest';
import { useIsMounted__INTERNAL, useStytchB2BClient } from '../b2b/StytchB2BContext';
import { noProviderError } from '../utils/errors';
import { invariant } from '../utils/invariant';
import useIsomorphicLayoutEffect from '../utils/useIsomorphicLayoutEffect';

export interface AdminPortalComponentProps<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Stytch B2B client to use.
   */
  client: StytchB2BHeadlessClient<TProjectConfiguration>;
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
  client: StytchB2BHeadlessClient<TProjectConfiguration>;
  element: HTMLElement;
}

export type ExcludeInjectedOptions<T> = Omit<T, keyof InjectedOptions<StytchProjectConfigurationInput>>;

export const makeAdminPortalComponent = <TProps extends AdminPortalComponentProps<StytchProjectConfigurationInput>>(
  mountFn: <TProjectConfiguration extends StytchProjectConfigurationInput>(
    props: ExcludeInjectedOptions<TProps> & InjectedOptions<TProjectConfiguration>,
  ) => void,
  componentName: string,
) => {
  const Component = <
    TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
  >(
    props: ExcludeInjectedOptions<TProps>,
  ): JSX.Element => {
    invariant(useIsMounted__INTERNAL(), noProviderError(`<${componentName} />`, 'StytchB2BProvider'));
    const stytchClient = useStytchB2BClient<TProjectConfiguration>();
    const containerEl = useRef<HTMLDivElement>(null);

    useIsomorphicLayoutEffect(() => {
      if (!containerEl.current) {
        return;
      }

      mountFn<TProjectConfiguration>({ ...props, client: stytchClient, element: containerEl.current });
    }, [stytchClient, props]);

    return <div ref={containerEl} />;
  };

  return Component;
};
