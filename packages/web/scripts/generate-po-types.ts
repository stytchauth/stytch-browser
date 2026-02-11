#!/usr/bin/env tsx

import * as fs from 'fs';
import { glob } from 'glob';
import * as path from 'path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';

import { generateTypeScriptTypes, parsePoFile } from '../src/utils/lingUiHelpers';

/* eslint-disable no-console */

async function processPoFile(poFilePath: string, typesOutputPath: string): Promise<void> {
  const content = fs.readFileSync(poFilePath, 'utf-8');

  const typesDir = path.dirname(typesOutputPath);
  fs.mkdirSync(typesDir, { recursive: true });

  const typeDefinition = generateTypeScriptTypes(parsePoFile(content));
  const formatted = await prettier.format(typeDefinition, {
    parser: 'typescript',
  });
  fs.writeFileSync(typesOutputPath, formatted, 'utf-8');
}

async function main() {
  const packageRoot = path.join(__dirname, '..');
  const messagesDir = path.join(packageRoot, 'messages');
  const srcMessagesDir = path.join(packageRoot, 'src/messages');

  const poFiles = await glob('**/en.po', {
    cwd: messagesDir,
    absolute: true,
  });

  for (const poFile of poFiles) {
    const relativePath = path.relative(messagesDir, poFile);
    const typesFile = path.join(srcMessagesDir, relativePath.replace(/\.po$/, '.types.ts'));

    console.log(`Processing ${path.relative(packageRoot, poFile)}...`);
    await processPoFile(poFile, typesFile);
    console.log(`Generated TypeScript types: ${path.relative(packageRoot, typesFile)}`);
  }

  console.log('Done!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
