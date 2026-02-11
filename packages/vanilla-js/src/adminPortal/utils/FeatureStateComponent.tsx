import React from 'react';
import { AdminPortalFeatureState } from './getFeatureState';
import { PageLoadingIndicator } from '../components/PageLoadingIndicator';
import { Alert } from '../components/Alert';

export const FeatureStateComponent = ({
  featureState,
  children,
  notLoggedInValue,
  errorValue,
  featureNotEnabledValue,
  noPermissionValue,
}: {
  featureState: AdminPortalFeatureState;
  children: React.JSX.Element;
  notLoggedInValue: string;
  errorValue: string;
  featureNotEnabledValue: string;
  noPermissionValue: string;
}) => {
  switch (featureState) {
    case 'loading':
      return <PageLoadingIndicator />;
    case 'notLoggedIn':
      return <Alert>{notLoggedInValue}</Alert>;
    case 'error':
      return <Alert>{errorValue}</Alert>;
    case 'featureNotEnabled':
      return <Alert>{featureNotEnabledValue}</Alert>;
    case 'noPermission':
      return <Alert>{noPermissionValue}</Alert>;
    case 'success':
      return children;
  }
};
