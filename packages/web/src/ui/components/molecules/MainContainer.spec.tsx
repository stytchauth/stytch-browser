import { parseCssVar } from './MainContainer';

describe(parseCssVar, () => {
  let getPropertyValue: jest.SpyInstance<string, [string]>;
  const element = {} as HTMLElement;

  beforeEach(() => {
    getPropertyValue = jest.fn();
    window.getComputedStyle = () =>
      ({
        getPropertyValue,
      }) as unknown as CSSStyleDeclaration;
  });

  it('return value unchanged if there are no variables', () => {
    expect(parseCssVar('768px', element)).toEqual('768px');
    expect(parseCssVar('calc(100px + 20em)', element)).toEqual('calc(100px + 20em)');

    expect(getPropertyValue).not.toHaveBeenCalled();
  });

  it('should replace var() with variable values', () => {
    getPropertyValue.mockReturnValue('100px');

    expect(parseCssVar('var(--test)', element)).toEqual('100px');
    expect(parseCssVar('var(--test, 20em)', element)).toEqual('100px');
    expect(parseCssVar('calc(var(--test) + 20em)', element)).toEqual('calc(100px + 20em)');

    expect(getPropertyValue).toHaveBeenCalledWith('--test');
  });

  it('should handle default value', () => {
    getPropertyValue.mockReturnValue('');

    expect(parseCssVar('var(--test, 20em)', element)).toEqual('20em');
    expect(parseCssVar('calc(var(--test, 100px) + 20em)', element)).toEqual('calc(100px + 20em)');

    // No element, return default value
    expect(parseCssVar('var(--test, 20em)', element)).toEqual('20em');
    expect(parseCssVar('calc(var(--test, 100px) + 20em)', element)).toEqual('calc(100px + 20em)');

    // No default given, return original var()
    expect(parseCssVar('var(--test)', element)).toEqual('var(--test)');
    expect(parseCssVar('calc(var(--test) + 20em)', element)).toEqual('calc(var(--test) + 20em)');

    expect(getPropertyValue).toHaveBeenCalledWith('--test');
  });

  it('should handle variables that reference other variables', () => {
    getPropertyValue.mockImplementation((v) => (v === '--a' ? 'var(--b)' : '20em'));

    expect(parseCssVar('var(--a)', element)).toEqual('20em');
    expect(getPropertyValue).toHaveBeenCalledWith('--a');
    expect(getPropertyValue).toHaveBeenCalledWith('--b');
  });
});
