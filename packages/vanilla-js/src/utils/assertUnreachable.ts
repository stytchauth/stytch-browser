export const assertUnreachable: (_: never) => never = () => {
  throw new Error('Assertion failure');
};
