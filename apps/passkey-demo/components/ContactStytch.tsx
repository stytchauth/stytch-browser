import { Alert, Link } from '@mui/material';
import React from 'react';

function ContactStytch() {
  return (
    <Alert severity="info">
      Survey Amp is a demo application created by Stytch. You can learn more about Stytch{' '}
      <Link target="_blank" rel="noopener" href="https://stytch.com/">
        here
      </Link>{' '}
      {' or '} <Link href="mailto:startups@stytch.com?subject=Contact Stytch via Survey Amp">contact us</Link> if you
      would like to talk to an auth expert.
    </Alert>
  );
}

export default ContactStytch;
