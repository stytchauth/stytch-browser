import { useMemo } from 'react';

import { noop } from '../shared/utils/noop';
import { ItemsPerPageOption, itemsPerPageOptions, useItemsPerPage } from './useItemsPerPage';
import { usePagination } from './usePagination';

export const useDisplayPagination = <T>({
  items,
  defaultItemsPerPage = 15,
  viewId,
}: {
  items: T[];
  defaultItemsPerPage?: ItemsPerPageOption;
  viewId: string;
}) => {
  const [itemsPerPage, handleItemsPerPageChange] = useItemsPerPage({ viewId, defaultItemsPerPage });

  const { currentPage, setCurrentPage } = usePagination({ itemsCount: items.length, itemsPerPage });
  const metadata = useMemo(() => ({ total: items.length, cursor: 'none' }), [items.length]);

  return {
    items,
    currentPage,
    setCurrentPage,
    loadNext: noop,
    metadata,
    rowsPerPage: itemsPerPage,
    rowsPerPageOptions: itemsPerPageOptions,
    onRowsPerPageChange: handleItemsPerPageChange,
  };
};
