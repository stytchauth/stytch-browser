export default IDP;
import { Nav } from '@stytch/internal-demo-utils';
import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Configure from './Configure';
import IDP from './idp';
import { PasskeyRegistration } from './PasskeyRegistration';
import { PasswordEML, PasswordOnly, PasswordOTP } from './Password';
import Permissions from './Permissions';
import Playground from './Playground';
import Reset from './Reset';
import Workbench from './Workbench';

const ROUTE_MANIFEST = [
  { title: 'Workbench', path: '/', Component: Workbench, showAlways: true },
  { title: 'Configure', path: '/configure', Component: Configure, showAlways: true },
  { title: 'Playground', path: '/playground', Component: Playground },
  { title: 'Password Only', path: '/password-only', Component: PasswordOnly },
  { title: 'Password + EML', path: '/password-eml', Component: PasswordEML },
  { title: 'Password + OTP', path: '/password-otp', Component: PasswordOTP },
  { title: 'Password Reset', path: '/reset', Component: Reset },
  { title: 'Passkey Registration', path: '/passkey-registration', Component: PasskeyRegistration },
  { title: 'Permissions', path: '/permissions', Component: Permissions },
  { title: 'OAuth Authorize', path: '/oauth/authorize', Component: IDP },
];

export const App = () => {
  return (
    <Router>
      <Nav manifest={ROUTE_MANIFEST} />
      <Routes>
        {ROUTE_MANIFEST.map((entry) => (
          <Route key={entry.title} path={entry.path} element={<entry.Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};
