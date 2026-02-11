import {
  CircularProgress,
  SxProps,
  TablePagination,
  TablePaginationProps,
  Theme,
  iconButtonClasses,
  styled,
  tablePaginationClasses,
} from '@mui/material';
import React, { ComponentType, useRef } from 'react';
import { InjectedComponents } from './componentInjection';
import { TableCoreProps } from './Table';
import { useToast } from './Toast';
import { useUniqueId } from '../../../utils/uniqueId';

export const DEFAULT_TABLE_ROWS_PER_PAGE = 20;
const LOAD_NEXT_PAGE_ERROR = 'Failed to load the next page.';
const ZERO_RESULTS_MESSAGE = 'No results found.';
const PAGINATED_TABLE_ID = 'paginated-table';

const TablePaginationContainer = styled('div')(({ theme }) => ({
  [`& .${tablePaginationClasses.actions} .${iconButtonClasses.root}`]: {
    padding: theme.spacing(1),
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 0,
}));

const EmptyTable = styled('div')<{ height?: number }>(({ height, theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(4),
  height,
}));

export type PaginatedTableCoreProps<T> = TableCoreProps<T> & {
  /**
   * The page number currently being displayed.  0-indexed.
   */
  currentPage: number;
  /**
   * A callback to call when the next page or previous page buttons are clicked.
   */
  setCurrentPage(page: number): void;
  /**
   * The number of rows to display per page.
   */
  rowsPerPage?: number;
  /**
   * If data is loaded lazily, this function will be called when the next page is requested.
   */
  loadNext(): void;
  /**
   * Whether the table is currently loading data and should display a loading spinner.
   */
  isLoading?: boolean;
  /**
   * Metadata about the paginated data
   * cursor: The cursor to use to fetch the next page of data
   * total: The total number of items in the paginated data
   */
  metadata?: {
    cursor: string;
    total: number;
  };
  rowsPerPageOptions?: readonly number[];
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  keepConsistentContentHeight?: boolean;
  tablePaginationSx?: SxProps<Theme>;
};

const defaultRowsPerPageOptions: number[] = [];

export const PaginatedTableCore = <T extends object>({
  currentPage,
  loadNext,
  isLoading,
  metadata,
  setCurrentPage,
  rowsPerPage = DEFAULT_TABLE_ROWS_PER_PAGE,
  rowsPerPageOptions = defaultRowsPerPageOptions,
  onRowsPerPageChange,
  keepConsistentContentHeight = true,
  tablePaginationSx,
  TableComponent: Table,
  TypographyComponent: Typography,
  ...tableProps
}: PaginatedTableCoreProps<T> &
  InjectedComponents<'Typography'> & { TableComponent: ComponentType<TableCoreProps<T>> }): JSX.Element => {
  const { items } = tableProps;
  const tableId = useUniqueId(PAGINATED_TABLE_ID);
  const { openToast } = useToast();
  const tableRowHeight = useRef<number>();
  const currFirstRowIndex = currentPage * rowsPerPage;

  const loadNextHandler = async (newPage: number) => {
    tableRowHeight.current = document.querySelector(`#${tableId} tbody tr`)?.clientHeight;
    const totalLoadedResults = items ? items.length : 0;
    if (metadata?.cursor && totalLoadedResults <= newPage * rowsPerPage) {
      try {
        await loadNext();
      } catch {
        openToast({ type: 'error', text: LOAD_NEXT_PAGE_ERROR });
      }
    }
  };

  const handleChangePage: TablePaginationProps['onPageChange'] = async (_, newPage) => {
    await loadNextHandler(newPage);
    setCurrentPage(newPage);
  };

  const pageResults = items.slice(currFirstRowIndex, currFirstRowIndex + rowsPerPage);

  const showLoading = isLoading;
  const showNoResults = !isLoading && items.length === 0;
  const showEmptyTable = showLoading || showNoResults;

  // [BACK-3158] Some searches will return -1 to indicate that the Total count was too expensive to be returned
  // In that case, we should _always_ show pagination controls
  let countForPagination: number;
  let moreRowsToShow: boolean;
  if (metadata?.total === -1) {
    // Pass -1 to the pagination component to enable pagination for an unknown # of items
    // Unless there's no cursor - in which case we know the total # of items
    countForPagination = metadata.cursor ? -1 : items.length;
    moreRowsToShow = true;
  } else {
    countForPagination = metadata?.total ?? 0;
    moreRowsToShow = (metadata?.total ?? 0) > rowsPerPage;
  }

  const showPagination = (!showEmptyTable && moreRowsToShow) || rowsPerPageOptions.length > 1;

  const paginationMarginTop = (rowsPerPage - pageResults.length) * (tableRowHeight.current ?? 0) - 1;

  return (
    <div id={tableId}>
      <Table {...tableProps} items={showEmptyTable ? [] : pageResults} />
      {showEmptyTable && (
        <EmptyTable
          height={
            tableRowHeight.current ? Math.min(rowsPerPage, pageResults.length) * tableRowHeight.current : undefined
          }
        >
          {showLoading && <CircularProgress color="inherit" />}
          {showNoResults && <Typography>{ZERO_RESULTS_MESSAGE}</Typography>}
        </EmptyTable>
      )}
      {showPagination && (
        <TablePaginationContainer style={keepConsistentContentHeight ? { marginTop: paginationMarginTop } : undefined}>
          <TablePagination
            sx={tablePaginationSx}
            component="div"
            count={countForPagination}
            onPageChange={handleChangePage}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions as number[]}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </TablePaginationContainer>
      )}
    </div>
  );
};
