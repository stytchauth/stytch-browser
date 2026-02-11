module.exports = [
  {
    name: 'Vanilla JS ESM',
    path: 'packages/vanilla-js/dist/index.esm.js',
  },
  {
    name: 'Vanilla JS CJS',
    path: 'packages/vanilla-js/dist/index.js',
  },
  {
    name: 'Vanilla JS Headless ESM',
    path: 'packages/vanilla-js/dist/index.headless.esm.js',
  },
  {
    name: 'Vanilla JS Headless CJS',
    path: 'packages/vanilla-js/dist/index.headless.js',
  },
  {
    name: 'Vanilla JS B2B ESM',
    path: 'packages/vanilla-js/dist/b2b/index.esm.js',
  },
  {
    name: 'Vanilla JS B2B ESM (UI Client only)',
    path: 'packages/vanilla-js/dist/b2b/index.esm.js',
    import: '{ StytchB2BUIClient }',
  },
  {
    name: 'Vanilla JS B2B ESM (Admin Portal)',
    path: 'packages/vanilla-js/dist/adminPortal/index.esm.js',
  },
  {
    name: 'Vanilla JS B2B ESM (Admin Portal SSO only)',
    path: 'packages/vanilla-js/dist/adminPortal/index.esm.js',
    import: '{ mountAdminPortalSSO }',
  },
  {
    name: 'Vanilla JS B2B ESM (Admin Portal Org Settings only)',
    path: 'packages/vanilla-js/dist/adminPortal/index.esm.js',
    import: '{ mountAdminPortalOrgSettings }',
  },
  {
    name: 'Vanilla JS B2B ESM (Admin Portal Member Management only)',
    path: 'packages/vanilla-js/dist/adminPortal/index.esm.js',
    import: '{ mountAdminPortalMemberManagement }',
  },
  {
    name: 'Vanilla JS B2B ESM (Admin Portal SCIM only)',
    path: 'packages/vanilla-js/dist/adminPortal/index.esm.js',
    import: '{ mountAdminPortalSCIM }',
  },
  {
    name: 'Vanilla JS B2B CJS',
    path: 'packages/vanilla-js/dist/b2b/index.js',
  },
  {
    name: 'Vanilla JS B2B Headless ESM',
    path: 'packages/vanilla-js/dist/b2b/index.headless.esm.js',
  },
  {
    name: 'Vanilla JS B2B Headless CJS',
    path: 'packages/vanilla-js/dist/b2b/index.headless.js',
  },
];
