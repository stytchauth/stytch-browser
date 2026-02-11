import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { AdminPortalCommonProps } from '@stytch/web/adminPortal/types';
import type { ComponentType } from 'react';

import { CreateSSRSafeWebComponent, IReactWebComponent } from './CreateWebComponent';

export type AdminPortalWebComponentOption = {
  /**
   * An HTML element or query selector string for the element that should contain the UI.
   * @example '#container'
   */
  element: string | HTMLElement;
};

export const makeAdminPortalComponentMountFn = <
  TMountOptions extends AdminPortalCommonProps<StytchProjectConfigurationInput>,
>(
  component: ComponentType<TMountOptions>,
  webComponentName: string,
  mountFunctionName: string,
) => {
  const WebComponent = CreateSSRSafeWebComponent<TMountOptions>(component, webComponentName);

  return (options: TMountOptions & AdminPortalWebComponentOption) => {
    const { client, element } = options;
    if (!client) {
      throw new Error('A Stytch B2B UI client must be provided.');
    }

    const targetParentDomNode = typeof element === 'string' ? document.querySelector(element) : element;
    if (!targetParentDomNode) {
      if (typeof element === 'string') {
        throw new Error(
          `The selector you specified (${element}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling ${mountFunctionName}().`,
        );
      }
      throw new Error(
        `The element you provided is not a valid DOM element. Make sure the element exists on the page before calling ${mountFunctionName}().`,
      );
    }
    /**
     * If mount is called again on the same element,
     * and it already has a matching child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === webComponentName.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<TMountOptions>;
      node.render(options);
      return;
    }

    /**
     * If mount is called for the first time,
     * make a new element!
     */
    const loginElement = WebComponent(options);
    targetParentDomNode.appendChild(loginElement);
  };
};
