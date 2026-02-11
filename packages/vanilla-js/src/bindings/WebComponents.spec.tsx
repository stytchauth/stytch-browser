import { StytchEvent as StytchEventTypeAlias, StytchEventType, StytchSDKUIError } from '@stytch/core/public';
import React from 'react';

import {
  createWebComponent,
  CreateWebComponentOptions,
  StytchDOMEvent,
  StytchError,
  StytchWebComponent,
} from './WebComponents';

describe('createWebComponent', () => {
  let componentCounter = 0;
  const getUniqueComponentName = () => `test-web-component-${componentCounter++}`;

  type TestProps = {
    stringProp: string;
    objectProp?: Record<string, unknown>;
    callbacks?: {
      onEvent?: (event: StytchEventTypeAlias) => void;
      onError?: (error: StytchSDKUIError) => void;
    };
  };

  // These allow tests to simulate internal events being triggered. Since the TestComponent represent the internal
  // React component, we call the callback function on the props to make sure the web component wrapper correctly
  // translate them to DOM events and pass them through
  let triggerEvent: (event: StytchEventTypeAlias) => void;
  let triggerError: (error: StytchSDKUIError) => void;
  const TestComponent = (props: TestProps) => {
    triggerEvent = (event) => props.callbacks?.onEvent?.(event);
    triggerError = (error) => props.callbacks?.onError?.(error);

    return (
      <div>
        <p data-testid="string-prop">{props.stringProp}</p>
        {props.objectProp && <p data-testid="object-prop">{JSON.stringify(props.objectProp)}</p>}
      </div>
    );
  };

  const setup = (
    options: CreateWebComponentOptions<TestProps> = {
      propNames: ['stringProp', 'objectProp', 'callbacks'],
      attributeNames: ['stringProp'],
    },
  ) => {
    const componentName = getUniqueComponentName();

    const define = () => {
      const TestWebComponent = createWebComponent<TestProps>(TestComponent, options);
      window.customElements.define(componentName, TestWebComponent);
      return TestWebComponent;
    };

    const mount = (attr: { stringProp?: string; shadow?: string } = {}) => {
      // Obviously injecting via innerHTML is not generally recommended but this is the easiest way to simulate
      // the entire HTML element being in the DOM all at once
      const attrString = Object.entries(attr)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      document.body.innerHTML = `<${componentName} ${attrString}></${componentName}>`;
      return document.querySelector<StytchWebComponent<TestProps>>(componentName)!;
    };

    const getChild = (prop: 'string' | 'object') =>
      document.querySelector(`${componentName} [data-testid="${prop}-prop"]`);

    const waitForRender = () => new Promise<void>((resolve) => window.queueMicrotask(resolve));

    return {
      componentName,
      mount,
      define,
      getChild,
      waitForRender,
    };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('HTML attribute logic', () => {
    it('reads attributes from the element on construction', async () => {
      const { define, mount, waitForRender, getChild } = setup();

      define();
      const element = mount({ stringProp: 'test-value' });

      // Attributes are read in constructor, so they should be available immediately
      expect(element.stringProp).toBe('test-value');
      await waitForRender();
      expect(getChild('string')!.textContent).toEqual('test-value');
    });

    it('reads attributes from the element before define', async () => {
      const { define, mount, waitForRender, getChild } = setup();

      mount({ stringProp: 'test-value' });
      define();

      await waitForRender();
      expect(getChild('string')!.textContent).toEqual('test-value');
    });

    it('reflects attributes to and from properties', async () => {
      const { define, mount, waitForRender, getChild } = setup();

      define();
      const component = mount({ stringProp: 'test' });

      await waitForRender();
      expect(getChild('string')).not.toBeNull();

      component.setAttribute('stringProp', 'attribute-value');
      expect(component.stringProp).toBe('attribute-value');

      component.stringProp = 'prop-value';
      expect(component.getAttribute('stringProp')).toBe('prop-value');
    });
  });

  describe('Prop logic', () => {
    it('allows setting props directly on the element', async () => {
      const { define, mount, waitForRender, getChild } = setup();

      define();
      const component = mount();

      component.stringProp = 'test-string';
      component.objectProp = { key: 'value' };

      await waitForRender();
      expect(getChild('string')!.textContent).toBe('test-string');
      expect(getChild('object')!.textContent).toBe('{"key":"value"}');
    });

    it('queues renders when multiple props are set', async () => {
      const { define, mount, waitForRender, getChild } = setup({
        propNames: ['stringProp'],
      });

      define();
      const component = mount();

      component.stringProp = 'first';

      await waitForRender();
      expect(getChild('string')?.textContent).toBe('first');
    });

    it('allows setting multiple props at once via render() method', async () => {
      const { define, mount, waitForRender, getChild } = setup();

      define();
      const component = mount();

      component.render({
        stringProp: 'rendered-string',
        objectProp: { key: 'value' },
      });

      await waitForRender();
      expect(getChild('string')?.textContent).toBe('rendered-string');
    });

    it('renders immediately when flushRender() is called', () => {
      const { define, mount, getChild } = setup();

      define();
      const component = mount();

      component.stringProp = 'immediate-value';
      component.flushRender();

      expect(getChild('string')?.textContent).toBe('immediate-value');
    });

    it('does not render when props are empty', async () => {
      const { define, mount, waitForRender, getChild } = setup({
        propNames: ['stringProp'],
      });

      define();
      mount();

      await waitForRender();

      expect(getChild('string')).toBeNull();
    });

    it('handles props set before component is registered', async () => {
      const { define, mount, waitForRender, getChild } = setup({
        propNames: ['stringProp'],
      });

      const component = mount();
      component.stringProp = 'pre-set-value';

      define();

      await waitForRender();
      expect(getChild('string')?.textContent).toBe('pre-set-value');
    });
  });

  describe('Event logic', () => {
    it('dispatches StytchEvent when onEvent callback is called', async () => {
      const { define, mount, waitForRender } = setup();

      define();
      const component = mount();

      const propOnEventSpy = jest.fn();
      component.render({
        stringProp: 'test',
        callbacks: { onEvent: propOnEventSpy },
      });

      const eventSpy = jest.fn();
      component.addEventListener('stytch-event', eventSpy);

      await waitForRender();

      const testEvent: StytchEventTypeAlias = {
        type: StytchEventType.AuthenticateFlowComplete,
        data: {},
      };

      triggerEvent(testEvent);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const dispatchedEvent = eventSpy.mock.calls[0][0] as StytchDOMEvent<StytchEventTypeAlias>;
      expect(dispatchedEvent).toBeInstanceOf(StytchDOMEvent);
      expect(dispatchedEvent).toMatchObject({
        stytchEventType: StytchEventType.AuthenticateFlowComplete,
        stytchEventData: {},
      });
      expect(propOnEventSpy).toHaveBeenCalledWith(testEvent);
    });

    it('dispatches StytchError when onError callback is called', async () => {
      const { define, mount, waitForRender } = setup();

      define();
      const component = mount();

      const errorSpy = jest.fn();
      const propOnErrorSpy = jest.fn();
      component.render({
        stringProp: 'test',
        callbacks: { onError: propOnErrorSpy },
      });
      component.addEventListener('stytch-error', errorSpy);

      await waitForRender();

      const testError: StytchSDKUIError = { message: 'Test error' };
      triggerError(testError);

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const dispatchedError = errorSpy.mock.calls[0][0] as StytchError;
      expect(dispatchedError).toBeInstanceOf(StytchError);
      expect(dispatchedError.error).toEqual(testError);
      expect(propOnErrorSpy).toHaveBeenCalledWith(testError);
    });
  });

  describe('Shadow DOM', () => {
    it('uses shadow DOM when shadow constructor option is true', async () => {
      const { define, waitForRender } = setup();
      const TestWebComponent = define();

      const component = new TestWebComponent({ shadow: true });
      document.body.appendChild(component);
      component.stringProp = 'shadow-test';

      await waitForRender();
      expect(component.shadowRoot).not.toBeNull();

      const stringEl = component.shadowRoot!.querySelector('[data-testid="string-prop"]')!;
      expect(stringEl.textContent).toBe('shadow-test');
    });

    it('uses shadow DOM when shadow attribute is set', async () => {
      const { define, mount, waitForRender } = setup();

      define();
      const component = mount({ shadow: 'true' });
      component.stringProp = 'shadow-attr-test';

      await waitForRender();
      expect(component.shadowRoot).not.toBeNull();

      const stringEl = component.shadowRoot!.querySelector('[data-testid="string-prop"]')!;
      expect(stringEl.textContent).toBe('shadow-attr-test');
    });

    it('reflects shadow attribute to enableShadowDOM config passed to component', async () => {
      type TestPropsWithConfig = TestProps & {
        presentation?: {
          options?: {
            enableShadowDOM?: boolean;
          };
        };
      };

      let capturedProps: TestPropsWithConfig | null = null;
      const ConfigTestComponent = (props: TestPropsWithConfig) => {
        capturedProps = props;
        return <p data-testid="enable-shadow-dom">{props.presentation?.options?.enableShadowDOM ? 'true' : 'false'}</p>;
      };

      const componentName = getUniqueComponentName();
      const TestWebComponent = createWebComponent<TestPropsWithConfig>(ConfigTestComponent, {
        propNames: ['stringProp', 'presentation'],
        attributeNames: ['stringProp'],
      });

      window.customElements.define(componentName, TestWebComponent);
      document.body.innerHTML = `<${componentName} shadow="true"></${componentName}>`;

      const component = document.querySelector<StytchWebComponent<TestPropsWithConfig>>(componentName)!;

      // Force a render (component will not render without at least one prop set)
      component.render({ stringProp: 'test' });
      await new Promise<void>((resolve) => window.queueMicrotask(resolve));

      expect(component.shadowRoot).not.toBeNull();
      expect(capturedProps!.presentation?.options?.enableShadowDOM).toBe(true);

      const enableShadowDomEl = component.shadowRoot!.querySelector('[data-testid="enable-shadow-dom"]')!;
      expect(enableShadowDomEl.textContent).toBe('true');
    });
  });
});
