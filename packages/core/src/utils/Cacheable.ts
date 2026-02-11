export type Cacheable<T> = T & {
  /**
   * If true, indicates that the value returned is from the application cache
   * and a state refresh is in progress.
   */
  fromCache: boolean;
};
