import { styled } from '@mui/material';
import { TagCore } from '../shared/components/Tag';
import { PropsWithChildren } from 'react';

export interface TagProps extends PropsWithChildren {
  size?: 'small' | 'large';
  hasTopAndBottomPadding?: boolean;
}

export const Tag = styled(TagCore)<TagProps>(({ theme, size, hasTopAndBottomPadding = true }) => ({
  fontFamily: theme.styleConfig.fontFamily,
  fontSize: size === 'small' ? theme.typography.caption.fontSize : theme.typography.body2.fontSize,
  backgroundColor: theme.styleConfig.colors.accent,
  padding: `${hasTopAndBottomPadding ? 8 : 0}px 11px`,
  height: 'fit-content',
  color: theme.styleConfig.colors.accentText,
}));
