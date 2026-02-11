import React from 'react';

import { Typography } from './Typography';

export const SettingsListItem = ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => {
  return (
    <>
      <Typography variant="body2" color="secondary" component="dt">
        {title}
      </Typography>
      <dd style={{ margin: '0 0 8px' }}>{children}</dd>
    </>
  );
};
