import { IStorageClient } from '@stytch/core';

import StytchReactNativeModule from './native-module';

const SUCCESS = { success: true };
const FAILURE = { success: false };

export class StorageClient implements IStorageClient {
  private nativeModule: StytchReactNativeModule;
  constructor() {
    this.nativeModule = new StytchReactNativeModule();
  }

  getData = async (key: string) => {
    const result = await this.nativeModule.Storage.getData(key);
    if (!result) return null;
    return result;
  };

  setData = async (key: string, data: string) => {
    try {
      const result = await this.nativeModule.Storage.setData(key, data);
      return !result ? { ...FAILURE, message: 'Unable to store data on device' } : SUCCESS;
    } catch {
      return { ...FAILURE, message: 'Unable to store data on device' };
    }
  };

  clearData = async (key: string) => {
    try {
      const result = await this.nativeModule.Storage.clearData(key);
      return !result ? { ...FAILURE, message: 'Unable to clear data from device' } : SUCCESS;
    } catch {
      return { ...FAILURE, message: 'Unable to clear data from device' };
    }
  };
}
