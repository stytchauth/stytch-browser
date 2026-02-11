import { useStytchSession } from '@stytch/nextjs';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { session, isInitialized } = useStytchSession();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (session) {
      router.replace('/profile');
    } else {
      router.replace('/login');
    }
  }, [session, isInitialized, router]);

  return <div>Loading...</div>;
}
