import { Nav } from '@stytch/internal-demo-utils';
import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import AdminPortal from './AdminPortal';
import Configure from './Configure';
import Discover from './Discover';
import IDP from './idp';
import OneTap from './OneTap';
import Org from './Org';
import Permissions from './Permissions';
import ResetPassword from './ResetPassword';
import Workbench from './Workbench';

const ROUTE_MANIFEST = [
  { title: 'Workbench', path: '/', Component: Workbench, showAlways: true },
  { title: 'Configure', path: '/configure', Component: Configure, showAlways: true },
  { title: 'Org Login', path: '/org/:slug?', Component: Org },
  { title: 'Reset Password', path: '/passwords/reset', Component: ResetPassword },
  { title: 'Discover', path: '/discover', Component: Discover },
  { title: 'Authenticate', path: '/authenticate', Component: Discover },
  { title: 'Permissions', path: '/permissions', Component: Permissions },
  { title: 'One Tap', path: '/onetap', Component: OneTap },
  { title: 'Admin Portal', path: '/admin', Component: AdminPortal },
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
