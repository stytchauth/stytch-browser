describe('style injector', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, '__nonce__');
    document.head.innerHTML = '';
  });

  const loadInjector = async () => {
    let injector: typeof import('@stytch/internal-style-injector') | undefined;
    await jest.isolateModulesAsync(async () => {
      injector = await import('@stytch/internal-style-injector');
    });
    if (!injector) throw new Error('style injector failed to load');
    return injector;
  };

  it('sets window.__nonce__ on the injected style element', async () => {
    Object.assign(window, { __nonce__: 'abc123' });
    const { injectGlobalStyle } = await loadInjector();

    injectGlobalStyle();

    expect(document.head.querySelector('style')?.nonce).toBe('abc123');
  });

  it('sets window.__nonce__ on the style element for a shadow root', async () => {
    Object.assign(window, { __nonce__: 'abc123' });
    const { injectCssIntoNode } = await loadInjector();

    expect(injectCssIntoNode().nonce).toBe('abc123');
  });

  it('leaves the nonce empty when window.__nonce__ is not set', async () => {
    const { injectGlobalStyle } = await loadInjector();

    injectGlobalStyle();

    expect(document.head.querySelector('style')?.nonce).toBe('');
  });
});
