export type Redacted<T, V> = {
  [K in keyof T]: V;
};
