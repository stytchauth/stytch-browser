import React, { createContext, useContext, ReactNode } from 'react';
import { AuthTokenParams, B2BIDPConsentManifestGenerator } from '../../types';

const ConsentManifestGeneratorContext = createContext<B2BIDPConsentManifestGenerator | undefined>(undefined);

const TrustedAuthTokenParamsContext = createContext<AuthTokenParams | undefined>(undefined);

interface Props {
  children: ReactNode;
  consentManifestGenerator?: B2BIDPConsentManifestGenerator;
  authTokenParams?: AuthTokenParams;
}

export const IDPContextProvider = ({ children, consentManifestGenerator, authTokenParams }: Props) => {
  return (
    <ConsentManifestGeneratorContext.Provider value={consentManifestGenerator}>
      <TrustedAuthTokenParamsContext.Provider value={authTokenParams}>
        {children}
      </TrustedAuthTokenParamsContext.Provider>
    </ConsentManifestGeneratorContext.Provider>
  );
};

export const useConsentManifestGenerator = (): B2BIDPConsentManifestGenerator | undefined =>
  useContext(ConsentManifestGeneratorContext);

export const useTrustedAuthTokenParams = (): AuthTokenParams | undefined => useContext(TrustedAuthTokenParamsContext);
