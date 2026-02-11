export interface StorageResponse {
  success: boolean;
  message?: string;
}

export interface IStorageClient {
  getData: (key: string) => Promise<string | null>;
  setData: (key: string, data: string) => Promise<StorageResponse>;
  clearData: (key: string) => Promise<StorageResponse>;
}
