export default IDP;
import React from 'react';
import Workbench from './Workbench';
import Playground from './Playground';
import Reset from './Reset';
import { PasswordOnly, PasswordEML, PasswordOTP } from './Password';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { PasskeyRegistration } from './PasskeyRegistration';
import Configure from './Configure';
import IDP from './idp';
import Permissions from './Permissions';

import { Nav } from '@stytch/internal-demo-utils';

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
