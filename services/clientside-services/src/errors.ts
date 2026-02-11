export function marshallError(error: Error): Record<string, unknown> {
  return {
    ...error,
    // Some builtin errors don't have these as enumerable properties, need to specify manually
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

class StytchError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

interface APIError {
  status_code: number;
  request_id?: string;
  error_type: string;
  error_message: string;
  error_url: string;
}

/**
 * An Error class wrapping a well-formed JSON error from the Stytch API.
 * The Stytch error should match one listed at {@link https://stytch.com/docs/api/errors}
 */
export class StytchAPIError extends StytchError implements APIError {
  error_type: string;
  error_message: string;
  error_url: string;
  request_id?: string;
  status_code: number;

  constructor(details: APIError) {
    const { status_code, error_type, error_message, error_url, request_id } = details;
    super(
      'StytchAPIError',
      `[${status_code}] ${error_type}\n` +
        `${error_message}\n` +
        `See ${error_url} for more information.\n` +
        (request_id ? `request_id: ${request_id}\n` : ''),
    );
    this.error_type = error_type;
    this.error_message = error_message;
    this.error_url = error_url;
    this.request_id = request_id;
    this.status_code = status_code;
  }

  static from(err: unknown): StytchAPIError {
    if (err instanceof StytchAPIError) {
      return err;
    }
    if (err && typeof err === 'object') {
      const maybe = err as Partial<APIError>;
      if (
        typeof maybe.status_code === 'number' &&
        typeof maybe.error_type === 'string' &&
        typeof maybe.error_message === 'string' &&
        typeof maybe.error_url === 'string'
      ) {
        return new StytchAPIError({
          status_code: maybe.status_code,
          error_type: maybe.error_type,
          error_message: maybe.error_message,
          error_url: maybe.error_url,
          request_id: typeof maybe.request_id === 'string' ? maybe.request_id : undefined,
        });
      }
    }
    const message = err instanceof Error ? err.message : 'Unknown error: ' + String(err);
    return new StytchAPIError({
      status_code: 400,
      error_type: 'unknown_error',
      error_message: message,
      error_url: '',
      request_id: undefined,
    });
  }
}
