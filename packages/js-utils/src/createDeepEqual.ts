type DeepEqualOpts = {
  KEYS_TO_EXCLUDE?: string[];
};

export const createDeepEqual = ({ KEYS_TO_EXCLUDE = [] }: DeepEqualOpts = {}) => {
  // If comparing functions, this may need some work. Not sure the
  // best path for this: compare instance (what it currently does),
  // stringify and compare, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deepEqual = (a: any, b: any): boolean => {
    // Ensures type is the same
    if (typeof a !== typeof b) return false;
    // arrays, null, and objects all have type 'object'
    if (a === null || b === null) return a === b;
    if (typeof a === 'object') {
      if (Object.keys(a).length !== Object.keys(b).length || Object.keys(a).some((k) => !(k in b))) return false;
      return Object.entries(a)
        .filter(([k]) => !KEYS_TO_EXCLUDE.includes(k))
        .every(([k, v]) => deepEqual(v, b[k]));
    }
    // boolean, string, number, undefined
    return a === b;
  };

  return deepEqual;
};
