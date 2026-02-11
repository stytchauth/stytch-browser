#!/usr/bin/env node

// AI generated image resizing script, to resize hidpi screenshots down from 2x

import sharp from 'sharp';
import { glob } from 'glob';
import { resolve, dirname, parse, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { renameSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// root is the assets directory (parent of scripts)
const root = resolve(__dirname, '..');
const cwd = process.cwd();

function getRelativePath(filePath) {
  return relative(cwd, filePath);
}

async function resizeImageToFactor(sourcePath, sourceFactor, targetFactor, outputPath) {
  const metadata = await sharp(sourcePath).metadata();
  const scaleFactor = targetFactor / sourceFactor;
  const newWidth = Math.round(metadata.width * scaleFactor);
  const newHeight = Math.round(metadata.height * scaleFactor);

  await sharp(sourcePath)
    .resize(newWidth, newHeight, {
      kernel: 'mks2021',
    })
    .toFile(outputPath);

  return { originalWidth: metadata.width, originalHeight: metadata.height, newWidth, newHeight };
}

async function processImage(filePath, maxFactor) {
  const parsed = parse(filePath);

  // Check if file already has a suffix
  const suffixMatch = parsed.name.match(/-(\d+)x$/);
  const currentFactor = suffixMatch ? parseInt(suffixMatch[1], 10) : maxFactor;
  const baseName = suffixMatch ? parsed.name.replace(/-(\d+)x$/, '') : parsed.name;

  // Use the file with the highest factor as source
  let sourcePath = filePath;
  const sourceFactor = currentFactor;

  // Generate all factors from maxFactor down to 1x
  const factorsToCreate = [];
  for (let f = maxFactor; f >= 1; f--) {
    if (f === sourceFactor) {
      // Rename the source file to have the suffix if it doesn't already
      if (!suffixMatch) {
        const targetPath = join(parsed.dir, `${baseName}-${f}x${parsed.ext}`);
        renameSync(sourcePath, targetPath);
        sourcePath = targetPath;
      }
      continue;
    }

    const targetPath =
      f === 1 ? join(parsed.dir, `${baseName}${parsed.ext}`) : join(parsed.dir, `${baseName}-${f}x${parsed.ext}`);

    // Skip if target already exists
    if (existsSync(targetPath)) {
      continue;
    }

    factorsToCreate.push({ factor: f, path: targetPath });
  }

  // Create all intermediate sizes from the source
  for (const { factor, path } of factorsToCreate) {
    await resizeImageToFactor(sourcePath, sourceFactor, factor, path);
  }

  return true;
}

async function resizeImages(globPattern, options = {}) {
  const { factor = 2 } = options;

  if (factor <= 0 || !Number.isInteger(factor)) {
    throw new Error('factor must be a positive integer');
  }

  // Resolve glob pattern - handle both glob patterns and specific file paths
  const hasWildcards = globPattern.includes('*') || globPattern.includes('?') || globPattern.includes('[');
  let allFiles;

  if (!hasWildcards) {
    // Specific file path
    const fullPath = globPattern.startsWith('/') ? globPattern : join(root, globPattern);
    allFiles = existsSync(fullPath) ? [fullPath] : await glob(join(root, globPattern), { ignore: ['node_modules/**'] });
  } else {
    // Glob pattern
    const pattern = globPattern.startsWith('/') ? globPattern : join(root, globPattern);
    allFiles = await glob(pattern, { ignore: ['node_modules/**'] });
  }

  if (!allFiles || allFiles.length === 0) {
    console.error(`No files found matching pattern: ${globPattern}`);
    return;
  }

  // Group files by base name (without suffix)
  const fileGroups = Object.create(null);

  for (const filePath of allFiles) {
    const parsed = parse(filePath);

    // Check for suffix pattern using regex
    const suffixMatch = parsed.name.match(/-(\d+)x$/);
    const fileFactor = suffixMatch ? parseInt(suffixMatch[1], 10) : 1;
    const baseName = suffixMatch ? parsed.name.replace(/-(\d+)x$/, '') : parsed.name;
    const baseKey = join(parsed.dir, `${baseName}${parsed.ext}`);

    fileGroups[baseKey] ??= [];
    fileGroups[baseKey].push({ path: filePath, factor: fileFactor });
  }

  // Process each group - prefer the highest factor file
  const filesToProcess = [];
  for (const files of Object.values(fileGroups)) {
    files.sort((a, b) => b.factor - a.factor);
    filesToProcess.push(files[0].path);
  }

  if (filesToProcess.length === 0) {
    return;
  }

  console.log(`Processing ${filesToProcess.length} file(s)...`);

  const failures = [];
  for (const filePath of filesToProcess) {
    try {
      await processImage(filePath, factor);
      console.log(`✓ ${getRelativePath(filePath)}`);
    } catch (error) {
      console.error(`✗ ${getRelativePath(filePath)}: ${error.message}`);
      failures.push(filePath);
    }
  }

  if (failures.length > 0) {
    console.error(`\nFailed: ${failures.length} file(s)`);
    process.exit(1);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { factor: 2 };
  let globPattern = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--factor') {
      const value = args[++i];
      if (!value) throw new Error('--factor requires a value');
      options.factor = parseInt(value, 10);
    } else if (!globPattern && !args[i].startsWith('--')) {
      globPattern = args[i];
    }
  }

  return { globPattern, options };
}

const { globPattern, options } = parseArgs();

if (!globPattern) {
  console.error('Usage: node resize-images.js <glob-pattern> [--factor <n>]');
  console.error('Example: node resize-images.js "files/**/*.png"');
  console.error('Example: node resize-images.js "files/**/*.{png,jpg}" --factor 3');
  console.error('');
  console.error('This script assumes files are at the specified factor (default 2x).');
  console.error(
    'It will rename the original file with the factor suffix and create a 1x version with the original name.',
  );
  process.exit(1);
}

resizeImages(globPattern, options).catch((error) => {
  console.error('Error resizing images:', error.message);
  process.exit(1);
});
