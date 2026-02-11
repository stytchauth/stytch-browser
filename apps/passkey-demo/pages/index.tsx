import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStytchSession } from '@stytch/nextjs';

export default function Home() {
  const router = useRouter();
  const { session, isInitialized } = useStytchSession();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (session) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [session, isInitialized, router]);

  return <div>Loading...</div>;
}
