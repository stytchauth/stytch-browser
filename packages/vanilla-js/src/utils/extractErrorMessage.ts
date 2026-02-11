export const extractErrorMessage = (error: unknown, messageFallback?: string) => {
  if (error && typeof error === 'object') {
    if ('error_message' in error && typeof error.error_message === 'string') {
      return error.error_message;
    }
    if (messageFallback) {
      return messageFallback;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
};
