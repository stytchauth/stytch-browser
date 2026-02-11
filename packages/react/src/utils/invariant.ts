// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(cond: any, message: string): asserts cond {
  if (!cond) throw new Error(message);
}
