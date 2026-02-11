import React from 'react';

export const SettingsList = ({ children }: { children: React.ReactNode }) => {
  return <dl style={{ margin: 0 }}>{children}</dl>;
};
