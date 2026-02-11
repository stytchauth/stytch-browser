import { Alert } from 'react-native';

export const createErrorAlert = (err: Error) => Alert.alert('Error', err.message, [{ text: 'OK' }]);
