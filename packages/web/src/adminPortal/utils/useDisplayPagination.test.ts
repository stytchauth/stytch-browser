import { act, renderHook } from '@testing-library/react';

import { useDisplayPagination } from './useDisplayPagination';

jest.mock('./useLocalStorage', () => ({
  useLocalStorage: jest.fn().mockImplementation(<T>(_key: string, defaultValue: T) => {
    let state = defaultValue;
    return [
      state,
      (newValue: T) => {
        state = newValue;
      },
    ];
  }),
}));

describe('useDisplayPagination', () => {
  const viewId = 'viewId';
  const defaultItemsPerPage = 10 as const;

  it('handles empty items list', () => {
    const { result } = renderHook(useDisplayPagination, {
      initialProps: { items: [], defaultItemsPerPage, viewId },
    });

    expect(result.current.currentPage).toBe(0);
  });

  it('handles multiple pages', () => {
    const items = Array.from({ length: defaultItemsPerPage * 3 + 1 }, (_, i) => i);

    const { result } = renderHook(useDisplayPagination, { initialProps: { items, defaultItemsPerPage, viewId } });

    expect(result.current.currentPage).toBe(0);

    act(() => {
      result.current.setCurrentPage(1);
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('handles partial single page', () => {
    const items = [1, 2, 3];

    const { result } = renderHook(useDisplayPagination, { initialProps: { items, defaultItemsPerPage, viewId } });

    expect(result.current.currentPage).toBe(0);

    act(() => {
      result.current.setCurrentPage(1);
    });
    expect(result.current.currentPage).toBe(0);
  });

  it('clamps current page when sufficient items are removed', () => {
    const items = Array.from({ length: defaultItemsPerPage * 3 + 1 }, (_, i) => i);

    const { result, rerender } = renderHook(useDisplayPagination, {
      initialProps: { items, defaultItemsPerPage, viewId },
    });

    expect(result.current.currentPage).toBe(0);

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    rerender({ items: items.slice(0, defaultItemsPerPage * 2), defaultItemsPerPage, viewId });

    expect(result.current.currentPage).toBe(1);

    rerender({ items, defaultItemsPerPage, viewId });

    expect(result.current.currentPage).toBe(1);
  });
});
