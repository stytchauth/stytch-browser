import { __clearcache, loadESModule } from './loadESModule';

const FooModule = { foo: 'I am the foo' };
const FooURL = 'https://example.com/foo.js';
// @ts-expect-error
const setGlobalFooModule = () => (global.Foo = FooModule);
// @ts-expect-error
const modFromGlobalScope = () => Foo.foo;
// @ts-expect-error
const unsetGlobalFooModule = () => delete global.Foo;

describe('loadESModule', () => {
  beforeEach(() => {
    unsetGlobalFooModule();
    jest.resetModules();
    document.head.innerHTML = '';
    __clearcache();
  });

  it('Resolves immediately when the script is in the DOM and the module is already loaded', async () => {
    document.head.innerHTML = `<script src='${FooURL}' data-loaded="true"></script>`;
    setGlobalFooModule();
    const mod = await loadESModule(FooURL, modFromGlobalScope);
    expect(mod).toBe(FooModule.foo);
  });

  it('Creates a script in the DOM when the module is not yet loaded', async () => {
    loadESModule(FooURL, modFromGlobalScope);

    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    const script = document.querySelector('script');
    expect(script).not.toBeNull();
    expect(script?.getAttribute('src')).toEqual(FooURL);
    expect(script?.dataset.loaded).toEqual(undefined);
  });

  it('When loading the script populates the module, returns the module', async () => {
    const prom = loadESModule(FooURL, modFromGlobalScope);

    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    const script = document.querySelector('script');
    setGlobalFooModule();
    script?.dispatchEvent(new Event('load'));
    expect(await prom).toBe(FooModule.foo);
    expect(script?.dataset.loaded).toEqual('true');
  });

  it('When two callers load the script , it is only loaded once', async () => {
    const prom1 = loadESModule(FooURL, modFromGlobalScope);
    const prom2 = loadESModule(FooURL, modFromGlobalScope);
    const prom3 = loadESModule(FooURL, modFromGlobalScope);

    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    const script = document.querySelector('script');
    setGlobalFooModule();
    script?.dispatchEvent(new Event('load'));
    await expect(prom1).resolves.toBe(FooModule.foo);
    await expect(prom2).resolves.toBe(FooModule.foo);
    await expect(prom3).resolves.toBe(FooModule.foo);

    expect(document.querySelectorAll('script').length).toBe(1);
  });

  it('When loading the script fails to populate the module, rejects', async () => {
    const prom = loadESModule(FooURL, modFromGlobalScope);

    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    const script = document.querySelector('script');
    // No call to setGlobalFooModule();
    script?.dispatchEvent(new Event('load'));
    await expect(prom).rejects.toThrow(/module was not found in global scope/);
  });

  it('When the script fails to load, rejects', async () => {
    const prom = loadESModule(FooURL, modFromGlobalScope);

    await new Promise((tick) => setInterval(tick, 0)); // Let v8 event loop run a few times

    const script = document.querySelector('script');
    script?.dispatchEvent(new Event('error'));
    await expect(prom).rejects.toThrow(/could not be loaded/);
  });
});
