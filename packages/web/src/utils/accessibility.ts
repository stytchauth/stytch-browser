import { useUniqueId } from './uniqueId';

/**
 * Common props for inputs to type accessibility props.
 */
export type InputLabelProps = {
  'aria-errormessage'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

/**
 * Helper to correctly set aria-errormessage and aria-invalid. error can be anything as long as it is falsy when
 * there is no error.
 *
 *  @example
 * const emailProps = useErrorProps(error);
 *
 * <EmailInput email={email} setEmail={setEmailInput} {...emailProps.input} />
 * {error && (
 *   <ErrorText
 *     errorMessage={parseErrorMessage(error)}
 *     {...emailProps.error}
 *   />
 * )}
 */
export function useErrorProps(error: unknown): {
  error: { id: string };
  input: { 'aria-errormessage'?: string; 'aria-invalid'?: boolean };
} {
  // The logic is not particularly complicated but it is annoying to keep writing for every input.
  // In particular, we don't want errormessage to be set if there is no error since some components always has the
  // ErrorText component always mounted.
  //
  // Reference:
  //  - aria-errormessage: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage
  //  - aria-invalid: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid

  const errorId = useUniqueId();

  if (!error) {
    return {
      error: { id: errorId },
      input: {},
    };
  } else {
    return {
      error: { id: errorId },
      input: {
        'aria-errormessage': errorId,
        'aria-invalid': true,
      },
    };
  }
}
