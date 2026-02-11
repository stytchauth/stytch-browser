import { Box, Button, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import {
  AuthenticationFactor,
  Products,
  StytchEventType,
  StytchPasskeyRegistration,
  useStytch,
  useStytchSession,
  useStytchUser,
} from '@stytch/nextjs';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import ContactStytch from '../components/ContactStytch';
import MobileHeader from '../components/mobile/MobileHeader';
import SideNavBar from '../components/SideNavBar';
import { resetDemo } from '../lib/utils';

enum StepUpType {
  email = 'email',
  phone = 'phone',
  webauthn = 'webauthn',
}

const StepUp = ({ type }: { type: StepUpType }) => {
  const [inputValue, setInputValue] = useState('');
  const [methodID, setMethodID] = useState('');
  const { user } = useStytchUser();
  const [err, setErr] = useState('');
  const stytch = useStytch();

  const validateOTPButtonClick = () => {
    stytch.otps.authenticate(inputValue, methodID, {
      session_duration_minutes: 60,
    });
  };

  const handleSendOTPButtonClick = () => {
    if (type === StepUpType.phone) {
      stytch.otps.sms
        .send(user!.phone_numbers!.at(0)!.phone_number, {
          expiration_minutes: 5,
        })
        .then((resp) => {
          setMethodID(resp.method_id);
        })
        .catch((e) => {
          setErr(e);
        });
    } else {
      stytch.otps.email
        .send(user!.emails!.at(0)!.email, {
          expiration_minutes: 5,
        })
        .then((resp) => {
          setMethodID(resp.method_id);
        })
        .catch(() => {
          setErr('Error occurred! Check console log.');
        });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  if (type === StepUpType.webauthn) {
    return (
      <>
        <h3>You need to step up {type} before creating Passkeys!</h3>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            stytch.webauthn.authenticate({ session_duration_minutes: 60 });
          }}
        >
          Step Up WebAuthn
        </Button>
      </>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
      <h3>You need to step up {type} before creating Passkeys!</h3>

      <Button variant="contained" color="primary" onClick={handleSendOTPButtonClick}>
        Send OTP to {type === StepUpType.email ? user!.emails!.at(0)!.email : user!.phone_numbers!.at(0)!.phone_number}
      </Button>

      {methodID && (
        <>
          <TextField label="Enter OTP" variant="outlined" value={inputValue} onChange={handleInputChange} />

          <Button variant="contained" color="primary" onClick={validateOTPButtonClick}>
            Validate OTP
          </Button>
        </>
      )}

      {err}
    </Box>
  );
};

const RegisterComponent = ({ numPasskeys }: { numPasskeys: number }) => {
  const [displayRegisterPasskey, setDisplayRegisterPasskey] = useState(false);

  return (
    <>
      {displayRegisterPasskey ? (
        <StytchPasskeyRegistration
          config={{
            products: [Products.passkeys],
          }}
          callbacks={{
            onEvent: ({ type, data }) => {
              if (type === StytchEventType.PasskeyDone || type === StytchEventType.PasskeySkip) {
                // eslint-disable-next-line no-console
                console.log('Passkey dismissed', data);
                setDisplayRegisterPasskey(false);
              }
            },
          }}
        />
      ) : (
        <>
          <Typography variant="caption">You have {numPasskeys} registered Passkey(s)</Typography>
          <Button onClick={() => setDisplayRegisterPasskey(true)}>Create a Passkey</Button>
        </>
      )}
    </>
  );
};

function Dashboard() {
  const router = useRouter();
  const stytch = useStytch();
  const { user, isInitialized } = useStytchUser();

  const { session } = useStytchSession();
  const [sessionHasWebauthnFactor, setSessionHasWebauthnFactor] = useState(false);
  const [sessionHasPhoneFactor, setSessionHasPhoneFactor] = useState(false);
  const [sessionHasEmailFactor, setSessionHasEmailFactor] = useState(false);
  const shouldPromptWebauthn =
    ((sessionHasPhoneFactor && !sessionHasWebauthnFactor) || (sessionHasEmailFactor && !sessionHasWebauthnFactor)) &&
    !!user?.webauthn_registrations?.length;
  const shouldPromptPhone = !sessionHasPhoneFactor && sessionHasWebauthnFactor && !!user?.phone_numbers?.length;
  const shouldPromptEmail = !sessionHasEmailFactor && sessionHasWebauthnFactor && !!user?.emails?.length;

  useEffect(() => {
    if (isInitialized && user === null) {
      router.push('/login');
    } else if (session) {
      session.authentication_factors.forEach((factor: AuthenticationFactor) => {
        if (factor.delivery_method === 'sms') {
          setSessionHasPhoneFactor(true);
        }
        if (factor.delivery_method === 'email') {
          setSessionHasEmailFactor(true);
        }
        if (factor.delivery_method === 'webauthn_registration') {
          setSessionHasWebauthnFactor(true);
        }
      });
      // eslint-disable-next-line no-console
      console.log(session);
    }
  }, [user, isInitialized, router, session]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const logout = () => {
    stytch.session.revoke();
  };

  return (
    <>
      <Head>
        <title>Survey Amp | Dashboard</title>
      </Head>
      <Box display={'flex'} width="100%" height="100vh" flexDirection={'column'}>
        {isMobile ? (
          <MobileHeader logout={() => logout()} />
        ) : (
          <Box
            display={'flex'}
            width="100%"
            minHeight={'60px'}
            alignItems="center"
            justifyContent={'space-between'}
            paddingX={3}
          >
            <Image src="/logo.png" alt="Vector art" width="149" height="34" />
            <ContactStytch />

            <Stack direction={'row'} display="flex" alignItems={'center'} gap={2}>
              <Image src="/help.png" alt="Vector art" width="24" height="24" />
              <Image src="/notifications.png" alt="Vector art" width="24" height="24" />
              <Image src="/account.png" alt="Vector art" width="53" height="53" />
              <Button onClick={() => resetDemo(user, stytch)}>Reset User Registrations</Button>
            </Stack>
          </Box>
        )}

        <Box display={'flex'} width="100%" minHeight={'90vh'}>
          {!isMobile && <SideNavBar logout={() => logout()} />}
          <Box
            display={'flex'}
            width="100%"
            minHeight={'calc(120vh - 60px)'}
            sx={{ backgroundColor: '#EEECFF' }}
            padding={4}
            flexDirection={'column'}
            alignItems={'center'}
            gap={2}
          >
            <Box
              display={'flex'}
              width="100%"
              sx={{ backgroundColor: 'black' }}
              flexDirection="column"
              alignSelf={'start'}
              padding={2}
              color="white"
            >
              <Typography variant="h1">Welcome!</Typography>
              <Typography variant="caption">You are now logged into SurveyAmp</Typography>
            </Box>
            {shouldPromptWebauthn && <StepUp type={StepUpType.webauthn} />}
            {shouldPromptPhone && <StepUp type={StepUpType.phone} />}
            {shouldPromptEmail && <StepUp type={StepUpType.email} />}
            {!shouldPromptEmail && !shouldPromptPhone && !shouldPromptWebauthn && (
              <RegisterComponent numPasskeys={user?.webauthn_registrations?.length ?? 0} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
