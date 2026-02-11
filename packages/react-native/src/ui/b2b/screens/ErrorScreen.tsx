import React from 'react';
import { Image, View } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGlobalReducer } from '../ContextProvider';
import { B2BErrorType } from '../../shared/types';
import { PageTitle } from '../components/PageTitle';
import { BodyText } from '../components/BodyText';

export const ErrorScreen = () => {
  const [state] = useGlobalReducer();
  const error = state.screenState.error;
  // This screen is only for our B2BErrorTypes; we're using the same error property for other screen level errors though
  // hence this check
  if (error?.internalError == undefined || !(error.internalError in B2BErrorType)) return;
  const b2bError = error.internalError as B2BErrorType;

  const ErrorTypeMap: Record<B2BErrorType, string> = {
    [B2BErrorType.Default]: 'Something went wrong. Try again later or contact your admin for help.',
    [B2BErrorType.NoValidProducts]: 'No valid authentication methods were found based on your configuration',
    [B2BErrorType.EmailMagicLink]:
      'Something went wrong. Your login link may have expired, been revoked, or been used more than once. Request a new login link to try again, or contact your admin for help.',
    [B2BErrorType.DiscoveryEmailMagicLink]:
      'Something went wrong during discovery. Your discovery login link may have expired, been revoked, or been used more than once. Request a new discovery login link to try again, or contact your admin for help.',
    [B2BErrorType.Organization]:
      'The organization you are looking for could not be found. If you think this is a mistake, contact your admin.',
    [B2BErrorType.CannotJoinOrgDueToAuthPolicy]: `Unable to join due to ${
      state.authenticationState.organization?.organization_name ?? 'the organization'
    }'s authentication policy. Please contact your admin for more information.`,
    [B2BErrorType.OrganizationDiscoveryClaimedDomain]:
      'Your email domain is associated with a particular organization, so you are unable to join or create other organizations. Please contact your admin for more information.',
  };

  return (
    <ScreenWrapper testID="ErrorScreen">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <PageTitle title="Looks like there was an error!" textAlign="center" />
        <Image style={{ width: 200, height: 200 }} testID="Error" source={require('../../assets/error.png')} />
        <BodyText text={ErrorTypeMap[b2bError]} textAlign="center" />
      </View>
    </ScreenWrapper>
  );
};
