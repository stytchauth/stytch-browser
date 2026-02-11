import { useLingui } from '@lingui/react/macro';
import React, { useMemo } from 'react';

import { useGlobalReducer } from '../../b2b/GlobalContextProvider';
import { AppScreens } from '../../b2b/types/AppScreens';
import { ErrorType } from '../../b2b/types/ErrorType';
import Button from '../atoms/Button';
import Column from '../atoms/Column';
import TextColumn from './TextColumn';

export const ErrorDisplay = ({ text, onGoBack }: { text: string; onGoBack?: () => void }) => {
  const { t } = useLingui();

  return (
    <Column gap={6}>
      <TextColumn header={t({ id: 'error.title', message: 'Looks like there was an error!' })} body={text} />

      {onGoBack && (
        <Button variant="outline" onClick={onGoBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      )}
    </Column>
  );
};

export const ErrorScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const { type: currentErrorType, canGoBack } = state.error;
  const organizationName = state.flowState.organization?.organization_name;

  const ErrorTypeMap: Record<ErrorType, string> = {
    [ErrorType.Default]: t({
      id: 'error.default',
      message: 'Something went wrong. Try again later or contact your admin for help.',
    }),
    [ErrorType.EmailMagicLink]: t({
      id: 'error.eml',
      message:
        'Something went wrong. Your login link may have expired, been revoked, or been used more than once. Request a new login link to try again, or contact your admin for help.',
    }),
    [ErrorType.Organization]: t({
      id: 'error.organization',
      message:
        'The organization you are looking for could not be found. If you think this is a mistake, contact your admin.',
    }),
    [ErrorType.CannotJoinOrgDueToAuthPolicy]: organizationName
      ? t({
          id: 'error.authPolicyWithOrg',
          message: `Unable to join due to ${organizationName}'s authentication policy. Please contact your admin for more information.`,
        })
      : t({
          id: 'error.authPolicyNoOrg',
          message:
            "Unable to join due to the organization's authentication policy. Please contact your admin for more information.",
        }),
    [ErrorType.AdBlockerDetected]: t({
      id: 'error.adBlockerDetected',
      message:
        'The request was blocked by an Ad Blocker. Please disable your ad blocker, refresh the page, and try again.',
    }),
    [ErrorType.OrganizationDiscoveryClaimedDomain]: t({
      id: 'error.claimedDomain',
      message:
        'Your email domain is associated with a particular organization, so you are unable to join or create other organizations. Please contact your admin for more information.',
    }),
  };

  const handleGoBack = useMemo(() => {
    if (canGoBack) {
      return () => dispatch({ type: 'transition', screen: AppScreens.Main });
    }
    return undefined;
  }, [canGoBack, dispatch]);

  return <ErrorDisplay text={ErrorTypeMap[currentErrorType]} onGoBack={handleGoBack} />;
};
