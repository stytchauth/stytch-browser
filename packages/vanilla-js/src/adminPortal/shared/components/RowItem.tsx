import { styled } from '@mui/material';
import { DEFAULT_GRID_COLUMN_WIDTH, DEFAULT_MAX_ITEM_WIDTH } from './constants';

export const RowItemCore = styled('div')<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  maxWidth: fullWidth ? DEFAULT_MAX_ITEM_WIDTH : DEFAULT_GRID_COLUMN_WIDTH,
}));
