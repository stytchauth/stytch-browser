import type { Callbacks, StytchEvent, StytchProjectConfigurationInput, StytchSDKUIError } from '@stytch/core/public';
import { injectCssIntoNode, injectGlobalStyle } from '@stytch/internal-style-injector';
import type { SDKConfig } from '@stytch/web';
import type { B2BSDKConfig } from '@stytch/web/b2b';
import React, { ComponentType } from 'react';
import { flushSync, render, unmountComponentAtNode } from 'react-dom';

// This doesn't really work I think, but it might in a future version of TS?
type ValidPropKeys = Exclude<string, keyof HTMLElement>;

/**
 * See https://stytch.com/docs/sdks/ui-callbacks for B2C and https://stytch.com/docs/b2b/sdks/ui-callbacks for B2B
 * event types and data
 */
export class StytchDOMEvent<T extends StytchEvent = StytchEvent> extends Event {
  readonly stytchEventType: T['type'];
  readonly stytchEventData: T['data'];

  constructor(event: T) {
    // Event names are lowercase for Vue which only accepts lowercase events
    super('stytch-event', { composed: true });

    this.stytchEventType = event.type;
    this.stytchEventData = event.data;
  }
}

/**
 * DOM event wrapper around {@link StytchSDKUIError}
 */
export class StytchError extends Event {
  constructor(public readonly error: StytchSDKUIError) {
    super('stytch-error', { composed: true });
  }
}

// Typing for public methods on the WebComponent
interface StytchWebComponentMethods<Props> {
  render(props: Props): void;
  flushRender(): void;
}

export type StytchWebComponent<Props extends Record<ValidPropKeys, unknown>> = HTMLElement &
  Props &
  StytchWebComponentMethods<Props>;

export type StytchWebComponentConstructor<Props extends Record<ValidPropKeys, unknown>> = new (init?: {
  shadow?: boolean;
}) => StytchWebComponent<Props>;

export type CreateWebComponentOptions<Props extends Record<ValidPropKeys, unknown>> = {
  /** The name of every property the component should support, i.e. every property on Props */
  propNames: readonly (keyof Props)[];

  /**
   * The name of DOM attributes we want to support. This should be every primitive prop
   * (i.e. string, number and boolean). Currently the code only properly supports strings, since boolean and numbers
   * needs casting
   **/
  attributeNames?: readonly (keyof Props)[];
};

/**
 * Creates a web component based on a React component, and an imperative mount() function
 * (mostly for backwards compatibility).
 *
 * Implementation notes:
 * - The component allows for attributes, properties and events. Props and attributes need to be declared
 *   and are handled separately.
 * - Currently, attributes are just treated all as strings, but in the future if we want we can also write
 *   functions to cast to booleans and numbers. We reflect attributes to properties following
 *   https://web.dev/articles/custom-elements-best-practices#avoid_reentrancy_issues
 * - Events are regular DOM events and fired using regular DOM dispatchEvent function
 * - Props use a setter to trigger re-rendering. We use an internal, private #props mainly to make
 *   types work. It also prevents Props clobbering HTML element properties.
 * - To allow multiple props to be set all at once, we schedule a render rather than immediately rendering
 *   on setting props. We also expose a render() function that lets users set multiple props at once.
 * - For rare cases where users want to render immediately, we also expose a flushRender() function
 *   (similar to React)
 * - The types are quite messy. TS does not have great higher order types needed to support the stuff
 *   here so there's going to be a lot of casting. See comments for explanation. We also manually write
 *   types (StytchWebComponentConstructor) and cast them to it.
 */
/* @__NO_SIDE_EFFECTS__ */
export function createWebComponent<Props extends Record<ValidPropKeys, unknown>>(
  Component: ComponentType<Props>,
  { propNames, attributeNames = [] }: CreateWebComponentOptions<Props>,
) {
  // If we're not in a browser env, return noop classes and components to avoid code trying to run the code below
  // which would only work in a browser
  if (typeof window === 'undefined') {
    return class implements StytchWebComponentMethods<Props> {
      render() {
        // noop
      }
      flushRender() {
        // noop
      }
      // This is also missing the HTMLElement part, but it must not try to extend that class
      // since it will not exist in non-browser environments
    } as unknown as StytchWebComponentConstructor<Props>;
  }

  // HTML attribute names are all lowercase, so we use a map of lowercase attribute name to camelCase prop name
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
  const attributeNameMap = Object.fromEntries(attributeNames.map((attr) => [(attr as string).toLowerCase(), attr]));

  // This class only implements StytchWebComponentMethods. It is basically impossible to type the '& Props'
  // part of the type. We implement in the constructor using Object.defineProperties but TS do not have the
  // higher order typings needed to make this really work, so we make a best-effort to type it, then use casts
  // to make up for it
  return class WebComponent extends HTMLElement implements StytchWebComponentMethods<Props> {
    /** Root element is the element our React component is mounted into */
    #mountPoint: HTMLElement | undefined;

    static observedAttributes = Object.keys(attributeNameMap);

    readonly #shadow: boolean;
    #renderQueued = false;
    #props = {} as Props;

    constructor({ shadow }: { shadow?: boolean } = {}) {
      super();

      // The shadow attribute can be set either already on the element, or passed in via the constructor.
      this.#shadow = shadow ?? this.getAttribute('shadow') != null;

      // For other attributes, reflect attributes to property
      for (const attr of WebComponent.observedAttributes) {
        const value = this.getAttribute(attr as string);
        if (value != null) {
          const propName = attributeNameMap[attr];
          this.#props[propName] = value as Props[typeof attr];
        }
      }

      for (const propName of propNames) {
        // In case properties were set before the component is registered
        if (Object.hasOwn(this, propName)) {
          this.#props[propName] = (this as unknown as Props)[propName];
        }

        // Make all accepted props reactive by defining getter/setter pairs for them
        // and triggering re-render on set
        Object.defineProperty(this, propName, {
          get: () => this.#props[propName],
          set: (value) => {
            // as string to exclude symbol and number even though they are not allowed in the Record key types
            if (attributeNames.includes(propName)) this.setAttribute(propName as string, value);

            this.#props[propName] = value;
            this.#queueRender();
          },
        });
      }
    }

    connectedCallback() {
      if (!this.#mountPoint) {
        this.#mountPoint = document.createElement('div');

        if (this.#shadow) {
          this.setAttribute('shadow', 'true');
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.appendChild(injectCssIntoNode());
          shadowRoot.appendChild(this.#mountPoint);
        } else {
          injectGlobalStyle();
          this.appendChild(this.#mountPoint);
        }
      }

      this.#queueRender();
    }

    disconnectedCallback() {
      if (this.#mountPoint) {
        unmountComponentAtNode(this.#mountPoint);
      }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      const propName = attributeNameMap[name];
      this.#props[propName] = newValue as Props[typeof propName];
    }

    render(props: Props) {
      Object.assign(this, props);
    }

    flushRender() {
      flushSync(() => {
        this.#renderInternal();
      });
    }

    // Internal methods
    #queueRender() {
      // We only want to call render once per tick
      if (!this.#renderQueued) {
        this.#renderQueued = true;

        window.queueMicrotask(() => {
          this.#renderInternal();
        });
      }
    }

    // This works with the one-tap slot defined in B2C GoogleOneTap. The node must be visible
    // to the outer DOM since the Google script looks for the node there, so use a slot we control
    // ourselves to do that
    #renderOneTap(props: Props) {
      const config = getConfig(props);
      if (
        !config?.oauthOptions?.providers.some(
          (config) => typeof config === 'object' && config.type === 'google' && config.one_tap,
        )
      ) {
        return;
      }

      if (!this.querySelector('#google-parent-prompt')) {
        const mountPoint = document.createElement('div');
        mountPoint.id = 'google-parent-prompt';
        mountPoint.slot = 'one-tap';
        this.appendChild(mountPoint);
      }
    }

    #callbacks: Callbacks<StytchProjectConfigurationInput> = {
      onError: (error) => {
        getCallbacks(this.#props)?.onError?.(error);
        this.dispatchEvent(new StytchError(error));
      },
      onEvent: (event: StytchEvent<StytchProjectConfigurationInput>) => {
        getCallbacks(this.#props)?.onEvent?.(event);
        this.dispatchEvent(new StytchDOMEvent(event));
      },
    };

    #renderInternal() {
      // This can happen if you try to update props before inserting this into the DOM
      if (!this.#mountPoint) return;

      this.#renderQueued = false;

      // Assume the component is not ready yet if there are no props
      if (Object.keys(this.#props).length === 0) {
        return;
      }

      this.#renderOneTap(this.#props);

      // Reflect shadow attr back onto enableShadowDOM config
      let props = this.#props;
      if (this.#shadow) {
        props = setShadow(props);
      }

      render(<Component {...props} callbacks={this.#callbacks} />, this.#mountPoint);
    }
  } as unknown as StytchWebComponentConstructor<Props>;
}

/* @__NO_SIDE_EFFECTS__ */
export function createMountFn<Props extends Record<ValidPropKeys, unknown>>(
  defaultName: string,
  WebComponent: StytchWebComponentConstructor<Props>,
) {
  if (typeof window === 'undefined') {
    return () => null as unknown as StytchWebComponent<Props>;
  }

  return ({ elementId, ...props }: Props & { elementId: string }) => {
    // Custom elements can only be defined once
    if (!customElements.get(defaultName)) {
      customElements.define(defaultName, WebComponent);
    }

    const targetNode = document.querySelector(elementId);
    if (!targetNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountLogin().`,
      );
    }

    // Re-render if the component is already mounted
    let node: StytchWebComponent<Props>;
    if (
      // HTML Node names all upper case always
      targetNode.firstChild?.nodeName.toLowerCase() === defaultName.toLowerCase()
    ) {
      node = targetNode.firstChild as StytchWebComponent<Props>;
      node.render(props as unknown as Props);
    } else {
      const shadow = getShadow(props);
      node = new WebComponent({ shadow });
      targetNode.appendChild(node);
    }

    return node;
  };
}

// Helper to avoid having to write the long cast everywhere.
// This duck types props have a config property which is either a B2C or B2B login config
function getConfig(props: Record<string, unknown> | undefined) {
  return (
    props as SDKConfig<StytchProjectConfigurationInput> | B2BSDKConfig<StytchProjectConfigurationInput> | undefined
  )?.config;
}

function getCallbacks(props: Record<string, unknown> | undefined) {
  return (props as { callbacks?: Callbacks<StytchProjectConfigurationInput> }).callbacks;
}

function getShadow(props: Record<string, unknown>) {
  const { config, presentation } = props as unknown as
    | SDKConfig<StytchProjectConfigurationInput>
    | B2BSDKConfig<StytchProjectConfigurationInput>;

  return presentation?.options?.enableShadowDOM ?? config?.enableShadowDOM;
}

function setShadow<T extends Record<string, unknown>>(props: T): T {
  const { presentation } = props as unknown as
    | SDKConfig<StytchProjectConfigurationInput>
    | B2BSDKConfig<StytchProjectConfigurationInput>;

  if (getShadow(props)) {
    return props;
  }

  return {
    ...props,
    presentation: {
      ...presentation,
      options: {
        ...presentation?.options,
        enableShadowDOM: true,
      },
    },
  };
}
