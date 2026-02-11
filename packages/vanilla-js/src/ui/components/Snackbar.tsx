import React from 'react';
import { Toaster } from 'react-hot-toast';

import { SuccessIcon } from '../../assets/snackbarSuccess';
import { ErrorIcon } from '../../assets/snackbarError';

const baseStyles: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  padding: '8px',
  fontSize: '14px',
  borderRadius: '4px',
};

const successStyles: React.CSSProperties = {
  ...baseStyles,
  background: '#ECFFF5',
  boxShadow: '0px 5px 10px rgba(15, 68, 71, 0.18)',
  color: '#0F4447',
};

const errorStyles: React.CSSProperties = {
  ...baseStyles,
  background: '#FFEEEC',
  boxShadow: '0px 5px 10px rgba(89, 6, 7, 0.2)',
  color: '#590607',
};

export const Snackbar = () => {
  return (
    <Toaster
      containerStyle={{ position: 'sticky', marginTop: '4px', marginBottom: '24px' }}
      toastOptions={{
        success: {
          style: successStyles,
          icon: <SuccessIcon />,
        },
        error: {
          style: errorStyles,
          icon: <ErrorIcon />,
        },
      }}
    />
  );
};
