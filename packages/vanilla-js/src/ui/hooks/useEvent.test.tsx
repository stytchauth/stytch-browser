import { renderHook, act } from '@testing-library/preact';
import { useEvent } from './useEvent';

describe('useEvent', () => {
  it('should call the latest function when callback is invoked', () => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();

    const { result, rerender } = renderHook((fn: (...args: unknown[]) => void) => useEvent(fn), {
      initialProps: mockFn1,
    });

    // Call with first function
    act(() => {
      result.current('test-arg');
    });

    expect(mockFn1).toHaveBeenCalledWith('test-arg');

    // Update to second function
    rerender(mockFn2);

    // Call with updated function
    act(() => {
      result.current('updated-arg');
    });

    expect(mockFn1).toHaveBeenCalledTimes(1); // Still only called once
    expect(mockFn2).toHaveBeenCalledWith('updated-arg');
  });

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useEvent(mockFn));

    act(() => {
      result.current('arg1', 'arg2', 'arg3');
    });

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should return the result of the function call', () => {
    const mockFn = jest.fn().mockReturnValue('test-result');
    const { result } = renderHook(() => useEvent(mockFn));

    let returnValue: string;
    act(() => {
      returnValue = result.current('test-arg');
    });

    expect(returnValue!).toBe('test-result');
  });

  it('should maintain stable reference even when function changes', () => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const mockFn3 = jest.fn();

    const { result, rerender } = renderHook((fn: (...args: unknown[]) => void) => useEvent(fn), {
      initialProps: mockFn1,
    });

    const callback1 = result.current;

    // Change function multiple times
    rerender(mockFn2);
    const callback2 = result.current;

    rerender(mockFn3);
    const callback3 = result.current;

    // All callbacks should be the same reference
    expect(callback1).toBe(callback2);
    expect(callback2).toBe(callback3);
  });
});
