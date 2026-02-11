import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { injectCssIntoNode, injectGlobalStyle } from '@stytch/internal-style-injector';
import { SDKConfig } from '@stytch/web';
import React from 'react';
import ReactDOM from 'react-dom';

export interface IReactWebComponent<P> extends HTMLElement {
  render(props: P): void;
}

type IReactWebComponentConstructor<P> = new (params: P) => IReactWebComponent<P>;

/**
 * NOTE: These are currently only used for admin portal components. Other Stytch UI components use
 * utils from WebComponents.tsx instead.
 *
 * An opinionated React Component to Web Component binder.
 * High-level points:
 * - All React props are passed as props on the div, no attributes involved
 * - No support for incremental updates of props
 */
export function CreateWebComponent<P extends React.JSX.IntrinsicAttributes & object>(
  ReactComponent: React.ComponentType<P>,
  webComponentName: string,
): IReactWebComponentConstructor<P> {
  const existingRegistry = customElements.get(webComponentName);
  if (existingRegistry) {
    return existingRegistry as IReactWebComponentConstructor<P>;
  }

  class ReactWebComponent extends HTMLElement implements IReactWebComponent<P> {
    props: P;
    rootRef: HTMLElement;
    mountPoint: HTMLElement | undefined;
    styleSlot: HTMLElement | undefined;

    constructor(props: P) {
      super();
      this.props = props;
      this.rootRef = document.createElement('div');
      this.append(this.rootRef);
    }

    connectedCallback() {
      injectGlobalStyle();

      this.styleSlot = document.createElement('section');
      this.rootRef.appendChild(this.styleSlot);

      this.mountPoint = document.createElement('span');
      this.styleSlot.appendChild(this.mountPoint);

      this.render(this.props);
    }

    disconnectedCallback() {
      if (!this.mountPoint) {
        return;
      }
      ReactDOM.unmountComponentAtNode(this.mountPoint);
    }

    render(props: P) {
      if (!this.mountPoint) {
        throw Error('Cannot render - no mount point defined');
      }
      if (!this.styleSlot) {
        throw Error('Cannot render - no style slot defined');
      }

      ReactDOM.render(<ReactComponent {...props} />, this.mountPoint);
    }
  }

  customElements.define(webComponentName, ReactWebComponent);

  return ReactWebComponent;
}

export function CreateShadowWebComponent<P extends React.JSX.IntrinsicAttributes & object>(
  ReactComponent: React.ComponentType<P>,
  webComponentName: string,
): IReactWebComponentConstructor<P> {
  const existingRegistry = customElements.get(webComponentName);
  if (existingRegistry) {
    return existingRegistry as IReactWebComponentConstructor<P>;
  }

  class ReactWebComponent extends HTMLElement implements IReactWebComponent<P> {
    props: P;
    rootRef: ShadowRoot;
    mountPoint: HTMLElement | undefined;
    styleSlot: HTMLElement | undefined;

    constructor(props: P) {
      super();
      this.props = props;
      this.rootRef = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      const style = injectCssIntoNode();
      this.rootRef.appendChild(style);

      this.styleSlot = document.createElement('section');
      this.rootRef.appendChild(this.styleSlot);

      this.mountPoint = document.createElement('span');
      this.styleSlot.appendChild(this.mountPoint);

      this.render(this.props);
    }

    disconnectedCallback() {
      if (!this.mountPoint) {
        return;
      }
      ReactDOM.unmountComponentAtNode(this.mountPoint);
    }

    render(props: P) {
      if (!this.mountPoint) {
        throw Error('Cannot render - no mount point defined');
      }
      if (!this.styleSlot) {
        throw Error('Cannot render - no style slot defined');
      }

      ReactDOM.render(<ReactComponent {...props} />, this.mountPoint);
    }
  }

  customElements.define(webComponentName, ReactWebComponent);

  return ReactWebComponent;
}

/**
 * Web Components aren't really isomorphic at all
 * but it's important to delay the construction & definition of the WC class until we are on the clientside
 * because the HTMLElement we extend from, and the customElement registry we modify, don't exist on the server
 */
export function CreateSSRSafeWebComponent<P extends React.JSX.IntrinsicAttributes & object>(
  ReactComponent: React.ComponentType<P>,
  webComponentName: string,
) {
  if (typeof window === 'undefined') {
    return () => null as unknown as IReactWebComponent<P>;
  }

  return <TProjectConfiguration extends StytchProjectConfigurationInput>(props: P): IReactWebComponent<P> => {
    const shadowDomEnabled = !!(props as unknown as SDKConfig<TProjectConfiguration>).config?.enableShadowDOM;
    if (shadowDomEnabled) {
      const Component = CreateShadowWebComponent(ReactComponent, webComponentName);
      return new Component(props);
    } else {
      const Component = CreateWebComponent(ReactComponent, webComponentName);
      return new Component(props);
    }
  };
}
