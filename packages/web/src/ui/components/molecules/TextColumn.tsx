import React, { ReactNode } from 'react';

import Column from '../atoms/Column';
import Typography, { TypographyProps } from '../atoms/Typography';

export type TextColumnProps = {
  header: ReactNode;
  body?: ReactNode;
  helper?: ReactNode;

  align?: TypographyProps['align'];
};

/**
 * Helper component for a common text layout pattern
 */
const TextColumn = ({ header, body, helper, align }: TextColumnProps) => (
  <Column gap={4}>
    <Typography variant="header" align={align}>
      {header}
    </Typography>
    {body && <Typography align={align}>{body}</Typography>}
    {helper && (
      <Typography variant="helper" align={align}>
        {helper}
      </Typography>
    )}
  </Column>
);

export default TextColumn;
