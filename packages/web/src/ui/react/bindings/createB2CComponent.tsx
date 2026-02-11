import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { injectCssIntoNode, injectGlobalStyle } from '@stytch/internal-style-injector';
import React, { ComponentType, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { StytchClient } from '../../../StytchClient';
import { PresentationConfig, StytchLoginConfig } from '../../../types';
import { useIsMounted__INTERNAL, useStytch } from '../b2c/StytchContext';
import { noProviderError, serverRenderError } from '../utils/errors';
import { invariant } from '../utils/invariant';

// Mirrors createB2BComponent and createWebComponent
export function createB2CComponent<
  Props extends {
    client: StytchClient<TProjectConfiguration>;
    config?: StytchLoginConfig;
    presentation?: PresentationConfig;
  },
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(name: string, Component: ComponentType<Props>) {
  const Wrapped: ComponentType<Omit<Props, 'client'>> = (props) => {
    serverRenderError(name);
    invariant(useIsMounted__INTERNAL(), noProviderError(`<${name} />`));

    const client = useStytch<TProjectConfiguration>();

    const shadow = props.presentation?.options?.enableShadowDOM ?? props.config?.enableShadowDOM;
    const root = useRef<HTMLDivElement>(null);
    const [mountPoint, setMountPoint] = useState<HTMLDivElement>();

    useLayoutEffect(() => {
      if (shadow) {
        if (!root.current || root.current.shadowRoot) return;
        const shadowRoot = root.current.attachShadow({ mode: 'open' });
        const mountPoint = document.createElement('div');

        shadowRoot.appendChild(injectCssIntoNode());
        shadowRoot.appendChild(mountPoint);

        setMountPoint(mountPoint);
      } else {
        injectGlobalStyle();
      }
    }, [shadow]);

    const element = <Component {...(props as Props)} client={client} />;
    if (shadow) {
      return <div ref={root}>{mountPoint && createPortal(element, mountPoint)}</div>;
    } else {
      return element;
    }
  };

  Wrapped.displayName = name;
  return Wrapped;
}
