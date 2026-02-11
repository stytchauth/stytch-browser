/**
 * Moves the first item that matches the predicate to the front of the array.
 * Returns a tuple of [reorderedArray, foundMatch] where foundMatch indicates
 * whether a matching item was found and moved.
 *
 * Note: Returns false if the array has only one item, but does return true even if the
 * item is found at index 0. This is behavior matches user expectation that you can't
 * really reorder an array of length 1.
 */
function moveToFront<T>(array: T[], predicate: (item: T) => boolean): [reorderedArray: T[], foundMatch: boolean] {
  // If the array has only one item, it can't be moved so we return false
  if (array.length <= 1) {
    return [array, false];
  }

  const matchingIndex = array.findIndex(predicate);
  if (matchingIndex === -1) {
    return [array, false];
  }

  const reordered = [...array];
  reordered.unshift(...reordered.splice(matchingIndex, 1));
  return [reordered, true];
}

// TODO: This weird structure is because export * seems to produce a type structure
//       that consuming packages downstream had issues with. Not entirely sure why,
//       I assume it's a TS bug that will be solved in the future?
export const arrayUtils = {
  moveToFront,
};
