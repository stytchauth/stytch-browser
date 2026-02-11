import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Collapse,
  IconButton,
  Table as MUITable,
  TableCell as MUITableCell,
  TableRow as MUITableRow,
  SxProps,
  TableBody,
  TableCellProps,
  TableContainer,
  TableHead,
  Theme,
  styled,
} from '@mui/material';
import React, { ComponentType, FC, MouseEventHandler, useEffect, useState } from 'react';
import { mergeSx } from '../utils/mergeSx';
import { getTableCellValue, validateRowKey } from '../utils/tableUtils';
import { useUniqueId } from '../../../utils/uniqueId';
import { TABLE_ACTIONS_HEADER, TableActionCoreProps } from './TableActions';
import { InjectedComponents } from './componentInjection';
import { TableItemRenderer } from './types';

const TABLE_CONTAINER_ID = 'table-container';
const EXPANDED_CONTENT_CLASSNAME = 'expanded-content';

// Keep the expanded content left aligned while the table is scrolled horizontally.
// We want to be able to scroll the table horizontally while making it appear like the expanded content is
// is not scrolling. To do this, we need to adjust the margin-left of the expanded content to match the
// scrollLeft of the table container.
const leftAlignExpandedContent = (containerId: string) => {
  const container = document.getElementById(containerId);
  const expandedContentDivs = document.querySelectorAll<HTMLElement>(`#${containerId} .${EXPANDED_CONTENT_CLASSNAME}`);
  expandedContentDivs.forEach((expandedContent) => {
    expandedContent.style.marginLeft = container?.scrollLeft + 'px';
  });
};

const StyledTable = styled(MUITable)<{ hasActions: boolean; hasExpandedContent: boolean }>(
  ({ hasActions, hasExpandedContent, theme }) => [
    hasActions && {
      // For some reason with position sticky, the table is 2px wider than the container
      width: 'calc(100% - 2px)',
    },
    hasExpandedContent && {
      // Remove spacing between expand more icon and first column
      '& tr td:nth-of-type(2), & tr th:nth-of-type(2)': {
        paddingLeft: theme.spacing(0),
      },
    },
  ],
);

const StyledTableRow = styled(MUITableRow)<{ expanded: boolean; clickable: boolean }>(({ clickable }) => [
  {
    width: 'fit-content',
  },
  clickable && {
    cursor: 'pointer',
  },
]);

const StyledTableCell = styled(MUITableCell)<{ isTableActionsCell?: boolean }>(({ theme, isTableActionsCell }) => [
  {
    padding: theme.spacing(0.5, 1),
    minWidth: 80,
    whiteSpace: 'nowrap',
  },
  isTableActionsCell && {
    position: 'sticky',
    right: 0,
    width: '1%',
  },
]);

const TableCell: FC<TableCellProps & InjectedComponents<'Typography'>> = ({
  children,
  className,
  TypographyComponent: Typography,
  ...props
}) => {
  const value = getTableCellValue(children);

  return (
    <StyledTableCell className={className} {...props}>
      {typeof value === 'string' ? <Typography variant="body2">{value}</Typography> : children}
    </StyledTableCell>
  );
};

const ExpandMoreCell = styled(MUITableCell)<{ hasExpandedContent: boolean }>(({ theme, hasExpandedContent }) => [
  {
    padding: theme.spacing(1),
    minWidth: 'unset',
  },
  hasExpandedContent && {
    borderBottom: 'none',
  },
]);

const ExpandedContentCell = styled(TableCell)({
  padding: 0,
});

const ExpandedContentContainer = styled('div')<{ width?: number }>(({ width, theme }) => ({
  padding: theme.spacing(0.5, 2, 1),
  width,
}));

const ChevronIcon = styled(ChevronRightIcon)<{ open: boolean }>(({ open }) => ({
  transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
}));

const TableHeaderCell = styled(MUITableCell)<{
  isExpandedContentHeader?: boolean;
  isActionsHeader?: boolean;
  width?: number;
}>(({ isActionsHeader, isExpandedContentHeader, width, theme }) => [
  {
    padding: theme.spacing(1.25, 1),
    width,
    minWidth: width,
  },
  isActionsHeader && {
    minWidth: 80,
    position: 'sticky',
    right: 0,
    width: width ?? '1%',
  },
  isExpandedContentHeader && {
    padding: theme.spacing(0, 0, 0, 1),
    width: theme.spacing(4.5),
    minWidth: 'unset',
  },
]);

type TableRowProps<T> = {
  id: string;
  ExpandedContent?: ComponentType<{ data: T }>;
  item: T;
  itemRenderer: TableItemRenderer<T>[];
  onRowClick?(id: string): void;
  tableWidth?: number;
  tableContainerId: string;
  getItemActionProps?: (item: T) => TableActionCoreProps;
  disableBottomBorder?: boolean;
  isOpen?: boolean;
  onOpenChange?: (event: { id: string; open: boolean }) => void;
  tableCellSx?: SxProps<Theme>;
  tableActionsCellSx?: SxProps<Theme>;
  tableRowSx?: SxProps<Theme>;
  expandMoreCellSx?: SxProps<Theme>;
  expandedContentContainerSx?: SxProps<Theme>;
};

const TableRow = <T extends object>({
  id,
  ExpandedContent,
  item,
  itemRenderer,
  onRowClick,
  tableWidth,
  tableContainerId,
  getItemActionProps,
  TableActionsComponent: TableActions,
  TypographyComponent: Typography,
  isOpen: isOpenProp,
  onOpenChange,
  tableCellSx,
  tableActionsCellSx,
  tableRowSx,
  expandMoreCellSx,
  expandedContentContainerSx,
}: TableRowProps<T> & InjectedComponents<'TableActions' | 'Typography'>): JSX.Element => {
  const isOpenControlled = isOpenProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = isOpenControlled ? isOpenProp : openState;

  useEffect(() => {
    if (open) {
      leftAlignExpandedContent(tableContainerId);
    }
  }, [open, tableContainerId]);
  const toggleOpen: MouseEventHandler = (e) => {
    e.stopPropagation();
    if (isOpenControlled) {
      onOpenChange?.({ id, open: !open });
    } else {
      setOpenState((prev) => !prev);
    }
  };

  const handleRowClick: MouseEventHandler = (e) => {
    if (onRowClick) {
      onRowClick(id);
    } else if (ExpandedContent) {
      toggleOpen(e);
    }
  };
  const stopEventPropagation: MouseEventHandler = (e) => (onRowClick ? e.stopPropagation() : null);

  return (
    <>
      <StyledTableRow clickable={!!onRowClick} expanded={open} onClick={handleRowClick} sx={tableRowSx}>
        {ExpandedContent && (
          <ExpandMoreCell hasExpandedContent={!!ExpandedContent} sx={mergeSx(tableCellSx, expandMoreCellSx)}>
            <IconButton aria-label="expand row" onClick={toggleOpen} size="small">
              {ExpandedContent && <ChevronIcon open={open} />}
            </IconButton>
          </ExpandMoreCell>
        )}
        {itemRenderer.map((column) => (
          <ExpandMoreCell
            sx={tableCellSx}
            hasExpandedContent={!!ExpandedContent}
            key={`row-${id}-col-${String(column.title)}`}
          >
            {column.getValue(item)}
          </ExpandMoreCell>
        ))}
        {getItemActionProps && (
          <StyledTableCell
            isTableActionsCell
            onClick={stopEventPropagation}
            sx={mergeSx(tableCellSx, tableActionsCellSx)}
          >
            <TableActions {...getItemActionProps(item)} />
          </StyledTableCell>
        )}
      </StyledTableRow>
      {ExpandedContent && (
        <MUITableRow>
          <ExpandedContentCell TypographyComponent={Typography} colSpan={itemRenderer.length + 1}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <ExpandedContentContainer
                className={EXPANDED_CONTENT_CLASSNAME}
                width={tableWidth}
                sx={expandedContentContainerSx}
              >
                <ExpandedContent data={item} />
              </ExpandedContentContainer>
            </Collapse>
          </ExpandedContentCell>
        </MUITableRow>
      )}
    </>
  );
};

export type TableCoreProps<T> = {
  ExpandedContent?: ComponentType<{ data: T }>;
  itemRenderer: TableItemRenderer<T>[];
  items: T[];
  rowKeyExtractor?(item: T): string;
  onRowClick?(id: string): void;
  getItemActionProps?: (item: T) => TableActionCoreProps;
  disableBottomBorder?: boolean;
  titleVariant?: 'h4' | 'body2' | 'caption';
  onOpenChange?: (event: { id: string; open: boolean }) => void;
  openIds?: Set<string>;
  tableCellSx?: SxProps<Theme>;
  tableActionsCellSx?: SxProps<Theme>;
  tableRowSx?: SxProps<Theme>;
  expandMoreCellSx?: SxProps<Theme>;
  expandedContentContainerSx?: SxProps<Theme>;
};

export const TableCore = <T extends { id?: string }>({
  ExpandedContent,
  itemRenderer,
  items,
  rowKeyExtractor,
  onRowClick,
  getItemActionProps,
  TableActionsComponent: TableActions,
  TypographyComponent: Typography,
  disableBottomBorder,
  titleVariant = 'body2',
  onOpenChange,
  openIds,
  tableCellSx,
  tableActionsCellSx,
  tableRowSx,
  expandMoreCellSx,
  expandedContentContainerSx,
}: TableCoreProps<T> & InjectedComponents<'TableActions' | 'Typography'>): JSX.Element => {
  const containerId = useUniqueId(TABLE_CONTAINER_ID);
  const [, setTableWidth] = useState<number>();

  // This useEffect is used to keep the expanded content left aligned while the table is scrolled horizontally.
  useEffect(() => {
    const container = document.getElementById(containerId);
    const originalTableWidth = document.querySelector(`#${containerId} thead`)?.getBoundingClientRect().width;

    // On scroll, adjust the position of the expanded content to keep it in view.
    function handleScroll() {
      if (!originalTableWidth || !container) return;
      const tableWidth = container.getBoundingClientRect().width;
      // If the table is scrolled all the way to the right, then we no longer need to adjust.
      if (originalTableWidth - container.scrollLeft + 16 >= tableWidth) {
        leftAlignExpandedContent(containerId);
      }
    }

    // on window resize, get the table width so we can set the width of the expanded content.
    function handleResize() {
      setTableWidth(container?.getBoundingClientRect().width ?? 0);
      handleScroll();
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    container?.addEventListener('scroll', handleScroll);
    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerId]);

  validateRowKey(items, rowKeyExtractor);

  return (
    <TableContainer id={containerId}>
      <StyledTable hasActions={!!getItemActionProps} hasExpandedContent={!!ExpandedContent}>
        <TableHead>
          <MUITableRow>
            {ExpandedContent && (
              <TableHeaderCell isExpandedContentHeader sx={expandMoreCellSx}>
                {/* Render nothing */}
                <></>
              </TableHeaderCell>
            )}
            {itemRenderer.map((column) => {
              const renderTitle = column.renderTitle ?? (() => column.title);
              const width = column.width;
              return (
                <TableHeaderCell key={`col-header-${String(column.title)}`} width={width}>
                  <Typography variant={titleVariant} color={titleVariant === 'h4' ? 'primary' : 'secondary'}>
                    {renderTitle()}
                  </Typography>
                </TableHeaderCell>
              );
            })}
            {getItemActionProps && (
              <TableHeaderCell isActionsHeader sx={mergeSx(tableCellSx, tableActionsCellSx)}>
                <Typography variant={titleVariant} color={titleVariant === 'h4' ? 'primary' : 'secondary'}>
                  {TABLE_ACTIONS_HEADER}
                </Typography>
              </TableHeaderCell>
            )}
          </MUITableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const id = rowKeyExtractor ? rowKeyExtractor(item) : (item.id as string);
            const isOpen = openIds?.has(id);
            return (
              <TableRow
                ExpandedContent={ExpandedContent}
                TableActionsComponent={TableActions}
                TypographyComponent={Typography}
                getItemActionProps={getItemActionProps}
                id={id}
                item={item}
                itemRenderer={itemRenderer}
                key={id}
                onRowClick={onRowClick}
                tableContainerId={containerId}
                disableBottomBorder={disableBottomBorder}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                tableCellSx={tableCellSx}
                tableActionsCellSx={tableActionsCellSx}
                tableRowSx={tableRowSx}
                expandMoreCellSx={expandMoreCellSx}
                expandedContentContainerSx={expandedContentContainerSx}
              />
            );
          })}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
