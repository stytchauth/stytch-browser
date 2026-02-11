import { ReactNode } from 'react';

export type OptionItem = {
  disabled?: boolean;
  label: string;
  value: string;
};

// Expand props types to make them more readable on hover in VSCode
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TableItemRenderer<T> = {
  title: string;
  renderTitle?: () => ReactNode;
  getValue(data: T, state?: Record<string, unknown>): string | number | boolean | ReactNode;
  width?: number;
};
