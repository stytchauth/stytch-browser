#!/usr/bin/env node

/**
 * Generates:
 * 1. .cursor/rules/*.mdc files by copying ai/rules/*.md files (which include frontmatter)
 * 2. CLAUDE.md by stripping frontmatter and concatenating ai/rules/*.md files
 */

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files to process in order (order matters for CLAUDE.md concatenation)
const ruleFiles = [
  'project-overview.md',
  'common-commands.md',
  'code-standards.md',
  'testing-standards.md',
  // output-rules.md is Cursor-specific, not included in CLAUDE.md
];

// Additional files that go to Cursor only (not in CLAUDE.md)
const cursorOnlyFiles = ['output-rules.md'];

const aiRulesDir = path.join(__dirname, 'rules');
const cursorRulesDir = path.join(__dirname, '../.cursor/rules');
const claudeMdPath = path.join(__dirname, '../CLAUDE.md');

// Ensure .cursor/rules directory exists
if (!fs.existsSync(cursorRulesDir)) {
  fs.mkdirSync(cursorRulesDir, { recursive: true });
}

/**
 * Strip YAML frontmatter from content
 */
function stripFrontmatter(content) {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n+/;
  return content.replace(frontmatterRegex, '');
}

/**
 * Copy a rule file to .cursor/rules/ with .mdc extension
 */
function copyToCursor(filename) {
  const sourcePath = path.join(aiRulesDir, filename);
  const targetFilename = filename.replace('.md', '.mdc');
  const targetPath = path.join(cursorRulesDir, targetFilename);

  try {
    fs.cpSync(sourcePath, targetPath);
    console.log(`✓ Copied ${filename} → .cursor/rules/${targetFilename}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to copy ${filename}:`, error.message);
    return false;
  }
}

/**
 * Generate CLAUDE.md from rule files
 */
function generateClaudeMd() {
  const header = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`;

  const sections = [];

  for (const filename of ruleFiles) {
    const sourcePath = path.join(aiRulesDir, filename);
    try {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const strippedContent = stripFrontmatter(content).trim();
      sections.push(strippedContent);
    } catch (error) {
      console.error(`✗ Failed to read ${filename} for CLAUDE.md:`, error.message);
    }
  }

  const claudeMdContent = header + sections.join('\n\n');

  try {
    fs.writeFileSync(claudeMdPath, claudeMdContent, 'utf-8');
    console.log(`✓ Generated CLAUDE.md`);
  } catch (error) {
    console.error(`✗ Failed to write CLAUDE.md:`, error.message);
  }
}

console.log('Generating Cursor rules and CLAUDE.md from ai/rules/...\n');

// Copy all rule files to .cursor/rules/
const allFiles = [...ruleFiles, ...cursorOnlyFiles];
for (const filename of allFiles) {
  copyToCursor(filename);
}

console.log('');

// Generate CLAUDE.md
generateClaudeMd();

console.log('\nDone!');
console.log('- Cursor rules generated in .cursor/rules/');
console.log('- CLAUDE.md generated at repository root');
