// Custom style injector runtime implementation
// For reference, this is the default that rollup-plugin-styler comes with
// https://github.com/plumelo/rollup-plugin-styler/blob/main/runtime/inject-css.js
//
// Ours is much simpler, we use a simple event bus to handle injecting styles to both global
// and shadow DOM. A custom injector also allows us to implement some additional features in
// the future, such as @layer support.
//
// This small file is its own package so we can rely on node-resolve plugin to resolve the
// import rather than adding additional alias plugin config.

const collected: string[] = [];
const handlers = new Set<(css: string) => void>();

/**
 * Used by Rollup config to collect CSS strings
 */
export function collectCss(css: string) {
  collected.push(css);
  handlers.forEach((handler) => handler(css));
}

function addHandler(handler: (css: string) => void) {
  handler(collected.join('\n'));
  handlers.add(handler);
  return () => handlers.delete(handler);
}

function findNonce() {
  // For backwards compatibility, the same convention as goober, the library used in previous versions
  const globalNonce = (window as unknown as Record<string, unknown>).__nonce__;
  if (typeof globalNonce === 'string' && globalNonce) {
    return globalNonce;
  }

  // With a header-delivered CSP, browsers clear the nonce attribute of connected elements, so it must be read from the nonce property
  const existing = document.querySelector<HTMLStyleElement | HTMLLinkElement>('style[nonce], link[nonce]');
  return existing?.nonce || undefined;
}

export function injectCssIntoNode() {
  const node = document.createElement('style');
  const nonce = findNonce();
  if (nonce) {
    node.nonce = nonce;
  }

  let firstRender = true;
  const unsubscribe = addHandler((css) => {
    if (firstRender || document.contains(node)) {
      node.textContent += css;
      firstRender = false;
    } else {
      unsubscribe();
    }
  });
  return node;
}

let globalStyleNode: HTMLStyleElement;
export function injectGlobalStyle() {
  if (!globalStyleNode) {
    globalStyleNode = injectCssIntoNode();
    document.head.appendChild(globalStyleNode);
  }
}
