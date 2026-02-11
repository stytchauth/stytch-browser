#!/usr/bin/env node

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'fs';
import { resolve, join, parse, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const cdnRoot = 'https://js.stytch.com/sdk-assets/';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');

const assetsDir = join(root, 'files');
const distDir = join(root, 'dist');
const assetsTsPath = join(distDir, 'index.ts');

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.CI);

async function hashFileGroup(filePaths) {
  const hashSum = createHash('sha256');
  // Sort file paths to ensure consistent hashing
  const sortedPaths = [...filePaths].sort();
  for (const filePath of sortedPaths) {
    const fileBuffer = readFileSync(filePath);
    hashSum.update(fileBuffer);
  }
  return hashSum.digest('hex').substring(0, 12);
}

function parseFilename(filePath) {
  const { name, ext } = parse(filePath);
  // Check for factor suffix pattern: -2x, -3x, etc.
  const factorMatch = name.match(/-(\d+)x$/);
  if (factorMatch) {
    const factor = factorMatch[1];
    const baseName = name.replace(/-(\d+)x$/, '');
    return { baseName, factor, ext };
  }
  return { baseName: name, factor: null, ext };
}

function getHashedFilename(baseName, hash, factor, ext) {
  if (factor) {
    return `${baseName}.${hash}.${factor}x${ext}`;
  }
  return `${baseName}.${hash}${ext}`;
}

function toCamelCase(str) {
  return str
    .split('-')
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

async function generateAssetManifest() {
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
  }

  const pattern = join(assetsDir, '**', '*.{png,jpg,jpeg,svg,gif,webp}');
  const files = await glob(pattern, { ignore: ['node_modules/**'] });

  // Group files by base name and directory
  const fileGroups = {};
  for (const filePath of files) {
    const relativePath = relative(assetsDir, filePath);
    const parsed = parseFilename(filePath);
    const relativeParsed = parse(relativePath);
    const groupKey = join(relativeParsed.dir, parsed.baseName);

    fileGroups[groupKey] ??= [];
    fileGroups[groupKey].push({ filePath, relativePath, relativeParsed, ...parsed });
  }

  const folderMappings = {};

  for (const [, groupFiles] of Object.entries(fileGroups)) {
    // Generate combined hash for the group
    const filePaths = groupFiles.map((f) => f.filePath);
    const hash = await hashFileGroup(filePaths);

    // Process each file in the group
    for (const { filePath, relativePath, relativeParsed, baseName, factor, ext } of groupFiles) {
      const hashedFilename = getHashedFilename(baseName, hash, factor, ext);
      const hashedPath = join(relativeParsed.dir, hashedFilename);

      // Copy file to dist directory
      const distFilePath = join(distDir, 'files', hashedPath);
      mkdirSync(parse(distFilePath).dir, { recursive: true });
      copyFileSync(filePath, distFilePath);

      // In dev mode vite.config.js has dist configured as a static dir
      // In prod the CDN path is used
      const resolvedUrl = isProduction ? cdnRoot + hashedPath : relative(distDir, distFilePath);

      // Each folder is a separate object, each key is the original file name in camel case
      const folderName = relativePath.split('/')[0];
      const exportName = toCamelCase(folderName) + 'Assets';
      // Use the original filename (with factor if present) for the camel case key
      const fileParsed = parse(filePath);
      const originalFilename = fileParsed.name;
      const camelCaseFileName = toCamelCase(originalFilename);

      folderMappings[exportName] ??= {};
      folderMappings[exportName][camelCaseFileName] = resolvedUrl;
    }
  }

  const ts = Object.entries(folderMappings)
    .map(([folderName, assets]) => `export const ${folderName} = ${JSON.stringify(assets, null, 2)} as const;`)
    .join('\n\n');

  writeFileSync(assetsTsPath, ts);

  console.log(
    `Generated ${Object.values(folderMappings).reduce((sum, folder) => sum + Object.keys(folder).length, 0)} assets`,
  );
  console.log(`TypeScript assets file written to: ${assetsTsPath}`);
  console.log(`Files with hash path copied to: ${distDir}`);
}

generateAssetManifest().catch((error) => {
  console.error('Error generating asset manifest:', error);
  process.exit(1);
});
