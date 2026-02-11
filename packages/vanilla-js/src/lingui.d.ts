// We need this file because some lingui packages use exports in package.json to
// specify type paths. We're using `node` moduleResolution with TypeScript,
// which doesn't support this. We can remove this file once we switch to
// `bundler` moduleResolution.

declare module '@lingui/cli' {
  export * from '@lingui/cli/dist/index';
}

declare module '@lingui/message-utils/compileMessage' {
  export * from '@lingui/message-utils/dist/compileMessage';
}
