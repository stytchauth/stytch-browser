import { waitFor } from '@testing-library/preact';
import React, { useEffect } from 'react';
import { CreateWebComponent } from './CreateWebComponent';

describe('CreateWebComponent', () => {
  /**
   * Without this, the final Jest cleanup will attempt to do the same thing
   * which triggers our disconnectedCallback() handler
   * which will fail, because the JSDOM won't exist(?) and it will not be possible to unmount a component
   * Attempted to log "Error: Uncaught [TypeError: Cannot read property 'body' of null]
   */
  afterEach(() => {
    document.body.innerHTML = '';
  });

  type Props = {
    primitive: string;
    obj: Record<string, unknown>;
    func: () => string;
  };

  const MyComponent = (props: Props) => (
    <div>
      <p>{props.primitive}</p>
      <p>{JSON.stringify(props.obj)}</p>
      <p>{props.func()}</p>
    </div>
  );

  const MyWebComponent = CreateWebComponent(MyComponent, 'my-component');

  it('Creates a web component that can accept props in the constructor and render them in React', async () => {
    const component = new MyWebComponent({
      primitive: 'I am a string',
      obj: { 'I am': 'An object' },
      func: () => 'Hello from func',
    });

    document.body.appendChild(component);
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.body.children[0]).toBeDefined();

    const innerHtml = (component as any).mountPoint.innerHTML;

    // We can still peek into the innerHTML though...
    expect(innerHtml).toContain('I am a string');
    expect(innerHtml).toContain(`{"I am":"An object"}`);
    expect(innerHtml).toContain(`Hello from func`);
  });

  const effectSpy = jest.fn();
  const MyComponentWithUnmountEffect = () => {
    useEffect(() => {
      effectSpy('mounted!');
      return () => {
        effectSpy('unmounted!');
      };
    }, []);
    return <div>I am effective!</div>;
  };

  const MyWebComponentWithUnmountEffect = CreateWebComponent(MyComponentWithUnmountEffect, 'my-sideffect-component');

  it('Unmounts the react component and triggers cleanups when the web-component is removed from the dom', async () => {
    const component = new MyWebComponentWithUnmountEffect({});
    document.body.appendChild(component);
    await waitFor(() => expect(effectSpy).toHaveBeenCalledWith('mounted!'));
    document.body.removeChild(component);
    await waitFor(() => expect(effectSpy).toHaveBeenCalledWith('unmounted!'));
  });
});
