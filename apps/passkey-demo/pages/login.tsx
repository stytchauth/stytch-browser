import { Box, useMediaQuery } from '@mui/material';
import { OTPMethods, Products, StytchEventType, StytchLogin, useStytchUser } from '@stytch/nextjs';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import ContactStytch from '../components/ContactStytch';
import MobileHeader from '../components/mobile/MobileHeader';

const LoginComponent = () => {
  const router = useRouter();

  return (
    <>
      <StytchLogin
        config={{
          products: [Products.otp, Products.passkeys],
          sessionOptions: { sessionDurationMinutes: 60 * 24 },
          otpOptions: {
            expirationMinutes: 10,
            methods: [OTPMethods.Email, OTPMethods.SMS],
          },
        }}
        callbacks={{
          onEvent: ({ type, data }) => {
            if (type === StytchEventType.PasskeyAuthenticate) {
              // eslint-disable-next-line no-console
              console.log('Passkey authenticated', data);
              router.push('/dashboard');
            }
            if (type === StytchEventType.OTPsAuthenticate) {
              // eslint-disable-next-line no-console
              console.log('OTP authenticated', data);
              router.push('/dashboard');
            }
          },
        }}
      />
    </>
  );
};

function LoginPage() {
  const { user } = useStytchUser();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      router.replace('/dashboard');
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  return (
    <>
      <Head>
        <title>Survey Amp | Login</title>
      </Head>
      <Box width={'100%'} height="100vh" display="flex">
        <Box display="flex" flexDirection={'column'} flexGrow={1} minWidth={isMobile ? undefined : 475}>
          {/* Header */}
          {isMobile ? (
            <MobileHeader />
          ) : (
            <>
              <Box mt={2} ml={2} display="flex" gap={2}>
                <Image src="/logo.png" alt="Vector art" width="149" height="34" />
              </Box>
            </>
          )}
          <Box
            height={'90%'}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginX: 2,
            }}
          >
            <LoginComponent />
          </Box>
          <Box m={2}>
            <ContactStytch />
          </Box>
        </Box>
        {!isMobile && (
          <Box
            width="60%"
            sx={{
              backgroundColor: '#D4CEFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image src="/login_img.png" alt="Vector art" width={500} height={500} />
          </Box>
        )}
      </Box>
    </>
  );
}

export default LoginPage;
