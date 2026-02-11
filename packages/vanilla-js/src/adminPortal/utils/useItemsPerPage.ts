import { useLocalStorage } from './useLocalStorage';

export const itemsPerPageOptions = [10, 15, 25, 50, 100] as const;
export type ItemsPerPageOption = (typeof itemsPerPageOptions)[number];

export const DEFAULT_ITEMS_PER_PAGE = 15;

export const useItemsPerPage = ({
  viewId,
  defaultItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: {
  viewId: string;
  defaultItemsPerPage?: ItemsPerPageOption;
}) => {
  const [itemsPerPage, setItemsPerPage] = useLocalStorage<number>(`${viewId}_itemsPerPage`, defaultItemsPerPage);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!Number.isNaN(value)) {
      setItemsPerPage(value);
    }
  };

  return [itemsPerPage, handleItemsPerPageChange] as const;
};
