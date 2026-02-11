export const extractErrorType = (error: unknown) => {
  if (error && typeof error === 'object') {
    if ('error_type' in error && typeof error.error_type === 'string') {
      return error.error_type;
    }
  }
};
