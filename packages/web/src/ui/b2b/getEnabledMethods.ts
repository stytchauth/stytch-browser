export const getEnabledMethods = <TMethod>({
  allMethods,
  orgSupportedMethods,
  uiIncludedMethods,
}: {
  allMethods: readonly TMethod[];
  orgSupportedMethods: readonly TMethod[];
  uiIncludedMethods: readonly TMethod[] | undefined;
}) => {
  // If the org only supported a restricted set of methods, use that
  if (orgSupportedMethods?.length) {
    return new Set(orgSupportedMethods);
  }

  // Use the configured list of included methods, or all methods by default
  const methodsArr = uiIncludedMethods?.length ? uiIncludedMethods : allMethods;
  return new Set(methodsArr);
};
