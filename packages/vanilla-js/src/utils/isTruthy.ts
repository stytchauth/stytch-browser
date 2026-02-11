type Falsy = false | null | undefined | 0 | 0n | '';

export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => Boolean(value);
