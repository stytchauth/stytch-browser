import React from 'react';

import { Typography } from './Typography';

export const Instruction = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body2">{children}</Typography>
);
