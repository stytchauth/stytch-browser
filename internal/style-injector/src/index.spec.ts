describe('style injector', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).__nonce__;
    document.head.innerHTML = '';
  });

  const loadInjector = () => import('./index');

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
