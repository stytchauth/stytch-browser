import { StytchEventType } from '@stytch/core/public';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { FormFieldError } from '../components/FormFieldError';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchInput } from '../components/StytchInput';
import { StytchTextButton } from '../components/StytchTextButton';
import { useEventCallback, useGlobalReducer } from '../ContextProvider';
import { useGetOrganizationBySlug } from '../hooks/useGetOrganizationBySlug';
import { useSSOStart } from '../hooks/useSSOStart';
import { createErrorResponseFromError } from '../utils';
import { Screen } from '.';

export const SSODiscoveryFallbackScreen = () => {
  const [, dispatch] = useGlobalReducer();
  const { getOrganizationBySlug } = useGetOrganizationBySlug();
  const { ssoStart } = useSSOStart();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const onEvent = useEventCallback();
  const handleTryAnotherMethod = () => dispatch({ type: 'navigate/to', screen: Screen.Main });
  const onSubmit = async () => {
    getOrganizationBySlug(slug)
      .then((response) => {
        onEvent({ type: StytchEventType.B2BOrganizationsGetBySlug, data: response });
        if (response.organization === null) {
          setError('Organization not found. Please try again.');
          return;
        }
        dispatch({ type: 'organization/getBySlug/success', response: response });
        if (response.organization.sso_active_connections.length === 1) {
          const [connection] = response.organization.sso_active_connections;
          ssoStart(connection.connection_id);
        } else {
          dispatch({ type: 'navigate/to', screen: Screen.Main });
        }
      })
      .catch((e) => {
        dispatch({ type: 'organization/getBySlug/error', error: createErrorResponseFromError(e) });
      });
  };
  return (
    <ScreenWrapper testID="SSODiscoveryFallbackScreen">
      <PageTitle title="Sorry, we couldn't find any connections" />
      <BodyText text="Please input the Organization's unique slug to continue. If you don't know the unique slug, log in through another method to view all of your available Organizations." />
      <StytchInput
        onChangeText={setSlug}
        value={slug}
        placeholder="Enter org slug"
        keyboardType="default"
        editable={true}
        autoCorrect={false}
      />
      {error && <FormFieldError text={error} />}
      <StytchTextButton enabled={!!slug} text="Continue" onPress={onSubmit} />
      <TouchableWithoutFeedback onPress={handleTryAnotherMethod}>
        <View style={{ marginTop: 24 }}>
          <BodyText text="Try another login method" />
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};
