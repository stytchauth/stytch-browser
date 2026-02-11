import { useState } from 'react';

export const usePagination = ({ itemsCount, itemsPerPage }: { itemsCount: number; itemsPerPage: number }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // keep current page clamped within range in case number of items shrinks
  const pageCount = Math.ceil(itemsCount / itemsPerPage);
  const lastPageIndex = Math.max(0, pageCount - 1);
  if (currentPage > lastPageIndex) {
    setCurrentPage(lastPageIndex);
  }

  return {
    currentPage,
    setCurrentPage,
  };
};
