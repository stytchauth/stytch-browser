import { StorageClient } from './StorageClient';

const getDataMock = jest.fn();
const setDataMock = jest.fn();
const clearDataMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      Storage = {
        getData: getDataMock,
        setData: setDataMock,
        clearData: clearDataMock,
      };
    },
  };
});

describe('StorageClient', () => {
  let client: StorageClient;

  beforeAll(() => {
    client = new StorageClient();
  });

  describe('getData', () => {
    it('Delegates to the native module', async () => {
      await client.getData('test');
      expect(getDataMock).toHaveBeenCalledWith('test');
    });
    it('Returns null if nothing is found', async () => {
      getDataMock.mockResolvedValue(undefined);
      const result = await client.getData('test');
      expect(result).toBe(null);
    });
    it('Returns the value from the native module when found', async () => {
      getDataMock.mockResolvedValue('value');
      const result = await client.getData('test');
      expect(result).toBe('value');
    });
  });

  describe('setData', () => {
    it('Delegates to the native module', async () => {
      await client.setData('test', 'value');
      expect(setDataMock).toHaveBeenCalledWith('test', 'value');
    });
    it('Returns failure result if exception is thrown', async () => {
      setDataMock.mockImplementationOnce(() => {
        throw Error('Test Error');
      });
      const result = await client.setData('test', 'value');
      expect(result).toEqual({ success: false, message: 'Unable to store data on device' });
    });
    it('Returns failure result if promise rejects', async () => {
      setDataMock.mockRejectedValueOnce(Error('Test Error'));
      const result = await client.setData('test', 'value');
      expect(result).toEqual({ success: false, message: 'Unable to store data on device' });
    });
    it('Returns failure result if promise resolves with a false', async () => {
      setDataMock.mockResolvedValueOnce(false);
      const result = await client.setData('test', 'value');
      expect(result).toEqual({ success: false, message: 'Unable to store data on device' });
    });
    it('Returns success result if saving succeeds', async () => {
      setDataMock.mockResolvedValueOnce(true);
      const result = await client.setData('test', 'value');
      expect(result).toEqual({ success: true });
    });
  });

  describe('clearData', () => {
    it('Delegates to the native module', async () => {
      await client.clearData('test');
      expect(clearDataMock).toHaveBeenCalledWith('test');
    });
    it('Returns failure result if exception is thrown', async () => {
      clearDataMock.mockImplementationOnce(() => {
        throw Error('Test Error');
      });
      const result = await client.clearData('test');
      expect(result).toEqual({ success: false, message: 'Unable to clear data from device' });
    });
    it('Returns failure result if promise rejects', async () => {
      clearDataMock.mockRejectedValueOnce(Error('Test Error'));
      const result = await client.clearData('test');
      expect(result).toEqual({ success: false, message: 'Unable to clear data from device' });
    });
    it('Returns failure result if promise resolves with a false', async () => {
      clearDataMock.mockResolvedValueOnce(false);
      const result = await client.clearData('test');
      expect(result).toEqual({ success: false, message: 'Unable to clear data from device' });
    });
    it('Returns success result if clearing succeeds', async () => {
      clearDataMock.mockResolvedValueOnce(true);
      const result = await client.clearData('test');
      expect(result).toEqual({ success: true });
    });
  });
});
