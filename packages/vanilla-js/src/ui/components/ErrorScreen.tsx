import React, { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Flex } from './Flex';
import { Text } from './Text';
import styled from 'styled-components';
import { useGlobalReducer } from '../b2b/GlobalContextProvider';
import { AppScreens } from '../b2b/types/AppScreens';
import { ErrorType } from '../b2b/types/ErrorType';
import BackArrowIcon from '../../assets/backArrow';

const ErrorSVG = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.1">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M99.9999 0C155.229 0 200 44.7715 200 99.9999C200 155.229 155.229 200 99.9999 200C44.7715 200 0 155.229 0 99.9999C0 44.7715 44.7715 0 99.9999 0Z"
        fill="url(#paint0_linear_4408_12810)"
      />
    </g>
    <g opacity="0.3">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M99.9993 17.5723C145.523 17.5723 182.427 54.4762 182.427 99.9993C182.427 145.523 145.523 182.427 99.9993 182.427C54.4762 182.427 17.5723 145.523 17.5723 99.9993C17.5723 54.4762 54.4762 17.5723 99.9993 17.5723Z"
        fill="url(#paint1_linear_4408_12810)"
      />
    </g>
    <g opacity="0.7">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M99.9987 32.2305C137.487 32.2305 167.877 62.6203 167.877 100.108C167.877 137.596 137.487 167.986 99.9987 167.986C62.5109 167.986 32.1211 137.596 32.1211 100.108C32.1211 62.6203 62.5109 32.2305 99.9987 32.2305Z"
        fill="url(#paint2_linear_4408_12810)"
      />
    </g>
    <path
      d="M100 45.8334C70.1 45.8334 45.8333 70.1 45.8333 100C45.8333 129.9 70.1 154.167 100 154.167C129.9 154.167 154.167 129.9 154.167 100C154.167 70.1 129.9 45.8334 100 45.8334ZM105.417 127.083H94.5833V116.25H105.417V127.083ZM105.417 105.417H94.5833V72.9167H105.417V105.417Z"
      fill="#8B1214"
    />
    <defs>
      <linearGradient
        id="paint0_linear_4408_12810"
        x1="-87.1375"
        y1="160.384"
        x2="169.669"
        y2="338.297"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="#8B1214" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_4408_12810"
        x1="-87.138"
        y1="160.384"
        x2="169.668"
        y2="338.297"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F7F0F0" />
        <stop offset="1" stopColor="#8B1214" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_4408_12810"
        x1="-87.1386"
        y1="160.493"
        x2="169.668"
        y2="338.405"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8B1214" stopOpacity="0.01" />
        <stop offset="1" stopColor="#E4C7C7" />
      </linearGradient>
    </defs>
  </svg>
);

const ErrorHeader = styled(Text)`
  text-align: center;
`;

export const ErrorDisplay = ({ text, onGoBack }: { text: string; onGoBack?: () => void }) => {
  const { t } = useLingui();

  return (
    <Flex direction="column" gap={24}>
      {onGoBack && <BackArrowIcon onClick={onGoBack} />}
      <Flex direction="column" gap={24} alignItems="center">
        <ErrorHeader size="header">{t({ id: 'error.title', message: 'Looks like there was an error!' })}</ErrorHeader>
        <ErrorSVG />
        <Text>{text}</Text>
      </Flex>
    </Flex>
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
