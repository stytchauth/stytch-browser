describe('style injector', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).__nonce__;
    document.head.innerHTML = '';
  });

  const loadInjector = () => import('./index');

  it('includes previously collected css in a new node', async () => {
    const { collectCss, injectCssIntoNode } = await loadInjector();

    collectCss('.a{color:red}');
    collectCss('.b{color:blue}');

    expect(injectCssIntoNode().textContent).toBe('.a{color:red}\n.b{color:blue}');
  });

  it('appends css collected after a node is attached', async () => {
    const { collectCss, injectCssIntoNode } = await loadInjector();
    collectCss('.a{}');
    const node = injectCssIntoNode();
    document.head.appendChild(node);

    collectCss('.b{}');

    expect(node.textContent).toBe('.a{}.b{}');
  });

  it('stops updating a node that was never attached or has been removed', async () => {
    const { collectCss, injectCssIntoNode } = await loadInjector();
    const detached = injectCssIntoNode();
    const removed = injectCssIntoNode();
    document.head.appendChild(removed);
    removed.remove();

    collectCss('.late{}');
    collectCss('.later{}');

    expect(detached.textContent).toBe('');
    expect(removed.textContent).toBe('');
  });

  it('injects the global style only once', async () => {
    const { collectCss, injectGlobalStyle } = await loadInjector();

    injectGlobalStyle();
    injectGlobalStyle();
    collectCss('.a{}');

    const styles = document.head.querySelectorAll('style');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe('.a{}');
  });

  it('sets window.__nonce__ on the injected style element', async () => {
    Object.assign(window, { __nonce__: 'abc123' });
    const { injectGlobalStyle, injectCssIntoNode } = await loadInjector();

    injectGlobalStyle();
    const glob = document.head.querySelector('style');
    const local = injectCssIntoNode();

    expect(glob?.nonce).toBe('abc123');
    expect(local.nonce).toBe('abc123');
  });

  it('leaves the nonce empty when window.__nonce__ is not set', async () => {
    const { injectGlobalStyle, injectCssIntoNode } = await loadInjector();

    injectGlobalStyle();
    const glob = document.head.querySelector('style');
    const local = injectCssIntoNode();

    expect(glob?.nonce).toBe('');
    expect(local.nonce).toBe('');
  });
});
