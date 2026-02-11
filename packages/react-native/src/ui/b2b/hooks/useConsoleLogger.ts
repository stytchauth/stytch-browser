import StytchReactNativeModule from '../../../native-module';

export const useConsoleLogger = () => {
  const nativeModules = new StytchReactNativeModule();
  const consoleLog = (message: string) => {
    nativeModules.ConsoleLogger.consoleLog(message);
  };

  return { consoleLog };
};
