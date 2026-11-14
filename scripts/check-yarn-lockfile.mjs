#!/usr/bin/env node

/**
 * Fails if yarn.lock references a private package registry.
 *
 * Yarn records `__archiveUrl` on a resolution when the tarball URL reported by the registry differs from the one Yarn
 * derives from the configured registry. With a private mirror (e.g. Artifactory) that URL points at the mirror, which
 * CI and Vercel cannot reach, so installs fail in the fetch step with ERR_SOCKET_CLOSED_BEFORE_CONNECTION.
 *
 * Besides `__archiveUrl`, any Artifactory or Twilio-internal hostname is rejected, since git or tarball resolutions can
 * leak the same way.
 *
 * Usage: node scripts/check-yarn-lockfile.mjs [path/to/yarn.lock]
 */

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lockfilePath = process.argv[2] ?? path.join(__dirname, '../yarn.lock');

const PRIVATE_REGISTRY_PATTERNS = [/__archiveUrl=/, /artifactory/i, /twilio(?:infra)?\.com/i];

const safeDecode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

const offending = fs
  .readFileSync(lockfilePath, 'utf8')
  .split('\n')
  .flatMap((text, index) =>
    PRIVATE_REGISTRY_PATTERNS.some((pattern) => pattern.test(text))
      ? [{ line: index + 1, text: safeDecode(text.trim()) }]
      : [],
  );

if (offending.length > 0) {
  console.error(`yarn.lock references a private registry in ${offending.length} place(s):\n`);
  for (const { line, text } of offending) {
    console.error(`  yarn.lock:${line}  ${text}`);
  }
  console.error(
    '\nThese URLs point at a private mirror that CI and Vercel cannot reach.\n' +
      'Remove the "::__archiveUrl=..." suffix from each resolution, or regenerate the entry with:\n' +
      '  YARN_NPM_REGISTRY_SERVER=https://registry.npmjs.org yarn install',
  );
  process.exit(1);
}
