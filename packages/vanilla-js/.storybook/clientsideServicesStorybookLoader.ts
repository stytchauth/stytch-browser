import { CLIENTSIDE_SERVICES_IFRAME_URL } from '@stytch/core';
import { ClientsideServicesProvider } from '../src/ClientsideServicesProvider';

const clientsideServicesProvider = new ClientsideServicesProvider(CLIENTSIDE_SERVICES_IFRAME_URL);

export const clientsideServicesLoader = async () => {
  await clientsideServicesProvider.parsedPhoneNumber({ phoneNumber: '', regionCode: 'US' });
  return { clientsideServicesProvider };
};
