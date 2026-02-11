import { OTPMethods, RNUIProducts } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';

import { DividerWithText } from '../components/DividerWithText';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { OAuthButton } from '../components/OAuthButton';
import { PageTitle } from '../components/PageTitle';
import { PhoneEntryForm } from '../components/PhoneEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { TabComponent } from '../components/TabComponent';
import { useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { generateProductComponentsOrdering, ProductComponent } from '../generateB2CProductComponentsOrdering';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { useOTPSmsLoginOrCreate } from '../hooks/otpSmsLoginOrCreate';
import { useOTPWhatsappLoginOrCreate } from '../hooks/otpWhatsappLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { useFonts } from '../hooks/useFonts';
import { useUserSearch } from '../hooks/userSearch';

export const MainScreen = () => {
  const config = useConfig();
  const theme = useTheme();
  const { getFontFor } = useFonts();
  const [state] = useGlobalReducer();
  const { searchForUser } = useUserSearch();
  const { sendEmailOTP } = useOTPEmailLoginOrCreate();
  const { sendEML } = useEmlLoginOrCreate();
  const { sendSMSOTP } = useOTPSmsLoginOrCreate();
  const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
  const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
  const hasEML = config.products.includes(RNUIProducts.emailMagicLinks);
  const hasEOTP = config.products.includes(RNUIProducts.otp) && config.otpOptions.methods.includes(OTPMethods.Email);
  const hasPasswords = config.products.includes(RNUIProducts.passwords);
  const hasEmail = hasEML || hasEOTP || hasPasswords;

  const tabTitles: string[] = [];
  if (config.products.includes(RNUIProducts.otp)) {
    for (const method of config.otpOptions.methods) {
      switch (method) {
        case OTPMethods.SMS:
          tabTitles.push('Text');
          break;
        case OTPMethods.WhatsApp:
          tabTitles.push('WhatsApp');
          break;
        case OTPMethods.Email:
          tabTitles.push('Email');
          break;
      }
    }
  }
  if (hasEmail && !tabTitles.includes('Email')) {
    tabTitles.push('Email');
  }

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [didProcessUserSearch, setDidProcessUserSearch] = useState(false);
  const [didSearchForUser, setDidSearchForUser] = useState(false);

  const ProductComponentsOrdering = generateProductComponentsOrdering(
    config.products,
    tabTitles.length > 1,
    tabTitles[selectedTabIndex],
  );

  useEffect(() => {
    // new and returning users get automatically redirected to the appropriate screen; passwordless users
    // need some extra processing based on the product config
    if (state.userState.userType != 'passwordless' || didProcessUserSearch || !didSearchForUser) return;
    setDidProcessUserSearch(true);
    if (hasEOTP) {
      sendEmailOTP();
      return;
    }
    if (hasEML) {
      sendEML();
      return;
    }
    // no Email OTP or EML, so set password
    resetPasswordByEmailStart('none');
    return;
  }, [
    state.userState.userType,
    hasEOTP,
    hasEML,
    sendEML,
    sendEmailOTP,
    resetPasswordByEmailStart,
    didProcessUserSearch,
    didSearchForUser,
  ]);
  const handleEmailEntered = () => {
    if (hasPasswords) {
      setDidSearchForUser(true);
      searchForUser();
      return;
    }
    if (hasEOTP) {
      sendEmailOTP();
      return;
    }
    if (hasEML) {
      sendEML();
      return;
    }
  };
  return (
    <ScreenWrapper testID="MainScreen">
      {!theme.hideHeaderText && <PageTitle title="Sign up or login" />}
      {ProductComponentsOrdering.map((component: ProductComponent) => {
        switch (component) {
          case ProductComponent.OAuthButtons:
            return config.oAuthOptions.providers.map((provider, index) => {
              return (
                <OAuthButton
                  key={`oauth-button-${index}`}
                  provider={provider}
                  deprecatedOptions={config.oAuthOptions}
                />
              );
            });
          case ProductComponent.TabComponent:
            return (
              <TabComponent
                key="tab"
                marginBottom={12}
                height={48}
                backgroundColor={theme.disabledButtonBackgroundColor}
                fontColor={theme.primaryTextColor}
                fontFamily={getFontFor('Roboto_Regular')}
                fontSize={14}
                values={tabTitles}
                selectedIndex={selectedTabIndex}
                tabColor={theme.buttonBackgroundColor}
                activeFontColor={theme.buttonTextColor}
                onChange={(e) => {
                  setSelectedTabIndex(e.selectedSegmentIndex);
                }}
              />
            );
          case ProductComponent.EmailEntryForm:
            return <EmailEntryForm key="email" onValidEmailEntered={handleEmailEntered} />;
          case ProductComponent.PhoneEntryFormText:
            return <PhoneEntryForm key="sms" onValidPhoneNumberEntered={sendSMSOTP} />;
          case ProductComponent.PhoneEntryFormWhatsApp:
            return <PhoneEntryForm key="whatsapp" onValidPhoneNumberEntered={sendWhatsAppOTP} />;
          case ProductComponent.Divider:
            return <DividerWithText key="divider" text="or" />;
        }
      })}
    </ScreenWrapper>
  );
};
