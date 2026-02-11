export const isEmptyObject = (value: object) => {
  for (const prop in value) {
    if (Object.prototype.hasOwnProperty.call(value, prop)) {
      return false;
    }
  }
  return true;
};
