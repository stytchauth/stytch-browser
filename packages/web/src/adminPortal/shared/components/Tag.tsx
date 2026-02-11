import { styled } from '@mui/material';

export const TagCore = styled('span')(({ theme }) => ({
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: '150%',
  padding: theme.spacing(0, 1),
  borderRadius: 4,
  width: 'fit-content',
}));
