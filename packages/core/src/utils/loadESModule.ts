const ModulePromiseCache: Record<string, Promise<unknown>> = {};

export const __clearcache = () => Object.keys(ModulePromiseCache).forEach((key) => delete ModulePromiseCache[key]);

export async function loadESModule<T>(url: string, moduleFromGlobalScope: () => T): Promise<T> {
  if (ModulePromiseCache[url] !== undefined) {
    return ModulePromiseCache[url] as Promise<T>;
  }

  ModulePromiseCache[url] = loadESModuleFromNetwork(url, moduleFromGlobalScope);
  return ModulePromiseCache[url] as Promise<T>;
}

function loadESModuleFromNetwork<T>(url: string, moduleFromGlobalScope: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    const maybeScript = findScript(url);
    if (maybeScript && maybeScript.dataset.loaded === 'true') {
      try {
        resolve(moduleFromGlobalScope());
      } catch (err) {
        return reject(new Error(`${url} already loaded, but module was not found in global scope: ${err}`));
      }
    }

    const script = createScript(url);

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      try {
        resolve(moduleFromGlobalScope());
      } catch (err) {
        reject(new Error(`${url} was loaded, but module was not found in global scope: ${err}`));
      }
    });

    script.addEventListener('error', (err) => {
      reject(new Error(`${url} could not be loaded: ${err}`));
    });
  });
}

const findScriptsInDom = (url: string) => document.querySelectorAll<HTMLScriptElement>(`script[src="${url}"]`);

function findScript(url: string): HTMLScriptElement | undefined {
  const scripts = findScriptsInDom(url);
  if (scripts[0]) {
    return scripts[0];
  }
}

function createScript(url: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.setAttribute('src', url);
  script.setAttribute('async', 'true');
  script.setAttribute('defer', 'true');
  document.head.appendChild(script);
  return script;
}
