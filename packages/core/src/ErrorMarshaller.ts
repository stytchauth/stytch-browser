import {
  StytchAPIUnreachableError,
  StytchAPIError,
  StytchAPISchemaError,
  SDKAPIUnreachableError,
  StytchSDKSchemaError,
  StytchSDKAPIError,
} from './public';

/**
 * Some errors are thrown from inside an iframe, but we can't serialize them
 * to the parent in Webkit. This class handles restoring marshalled errors
 * to their original form.
 * It preserves the error instance/class constructor by inspecting err.name
 * and calling `new` on the matching constructor.
 */
export class ErrorMarshaller {
  static inflate<T extends new (...any: never[]) => Error>(ErrorClass: T, ErrorData: Record<string, unknown>): Error {
    // !!HACK!!
    // We make the assumption that if the error takes in a required property
    // (StytchAPIError takes in an APIDetails obj...)
    // that we can just pass in the error body itself to satisfy the constructor...
    // And if the types don't work out, Object.assign(...) copies everything over anyway
    // This is a brittle and weak assumption.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const err = new ErrorClass(ErrorData);
    Object.assign(err, ErrorData);
    Object.setPrototypeOf(err, ErrorClass.prototype);
    return err as Error;
  }

  static unmarshall(error: Record<string, unknown>): Error {
    if ('name' in error) {
      switch (error.name) {
        case 'SDKAPIUnreachableError':
          return ErrorMarshaller.inflate(SDKAPIUnreachableError, error);
        case 'StytchSDKSchemaError':
          return ErrorMarshaller.inflate(StytchSDKSchemaError, error);
        case 'StytchAPIUnreachableError':
          return ErrorMarshaller.inflate(StytchAPIUnreachableError, error);
        case 'StytchAPISchemaError':
          return ErrorMarshaller.inflate(StytchAPISchemaError, error);
        case 'StytchSDKAPIError':
          return ErrorMarshaller.inflate(StytchSDKAPIError, error);
        case 'StytchAPIError':
          return ErrorMarshaller.inflate(StytchAPIError, error);
        case 'TypeError':
          return ErrorMarshaller.inflate(TypeError, error);
        case 'SyntaxError':
          return ErrorMarshaller.inflate(SyntaxError, error);
        case 'ReferenceError':
          return ErrorMarshaller.inflate(ReferenceError, error);
        case 'RangeError':
          return ErrorMarshaller.inflate(RangeError, error);
        case 'EvalError':
          return ErrorMarshaller.inflate(EvalError, error);
        case 'URIError':
          return ErrorMarshaller.inflate(URIError, error);
      }
    }
    return ErrorMarshaller.inflate(Error, error);
  }
}
