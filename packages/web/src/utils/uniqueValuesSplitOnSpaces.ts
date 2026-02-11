export const uniqueValuesSplitOnSpaces = ({ input }: { input: string }) => {
  return new Set(
    input
      .split(' ')
      .map((val) => val.trim())
      .filter((val) => val.length > 0),
  );
};
