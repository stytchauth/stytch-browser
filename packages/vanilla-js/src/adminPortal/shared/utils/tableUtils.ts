import { ReactNode } from 'react';

export const validateRowKey = <T extends { id?: string } | string>(
  items: T[],
  rowKeyExtractor?: (item: T) => string,
): void => {
  if (
    items.length > 0 &&
    typeof items[0] !== 'string' &&
    (!items[0]?.id || typeof items[0].id !== 'string') &&
    !rowKeyExtractor
  ) {
    throw new Error('rowKeyExtractor is required if items are not strings or do not have an id property');
  }
};

export const getTableCellValue = (children: ReactNode): ReactNode => {
  let value = children;
  if (typeof children === 'string' || typeof children === 'number' || typeof children === 'boolean') {
    value = String(children);
  }

  if (!children) {
    value = '–';
  }
  return value;
};
