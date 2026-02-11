// Inspired by https://github.com/jestjs/jest/issues/5785#issuecomment-769475904
export const expectToThrow = (callback: () => unknown, error?: JestToErrorArg): void => {
  const spy = jest.spyOn(console, 'error');
  spy.mockImplementation();

  expect(callback).toThrow(error);

  spy.mockRestore();
};

type JestToErrorArg = Parameters<jest.Matchers<unknown, () => unknown>['toThrow']>[0];
