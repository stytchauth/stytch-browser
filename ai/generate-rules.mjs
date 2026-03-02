#!/usr/bin/env node

/**
 * Generates:
 * 1. .cursor/rules/*.mdc files by copying ai/rules/*.md files (which include frontmatter)
 * 2. .github/copilot-instructions.md by stripping frontmatter and concatenating repository-wide rules
 * 3. .github/instructions/*.instructions.md path-specific files for rules with specific globs
 * 4. CLAUDE.md by stripping frontmatter and concatenating ai/rules/*.md files
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
const githubDir = path.join(__dirname, '../.github');
const copilotInstructionsDir = path.join(githubDir, 'instructions');
const copilotInstructionsPath = path.join(githubDir, 'copilot-instructions.md');
const claudeMdPath = path.join(__dirname, '../CLAUDE.md');

// Ensure directories exists
fs.mkdirSync(cursorRulesDir, { recursive: true });
fs.mkdirSync(githubDir, { recursive: true });
fs.mkdirSync(copilotInstructionsDir, { recursive: true });

/**
 * Parse YAML frontmatter from content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n+/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, content };
  }

  const frontmatterText = match[1];
  const frontmatter = {};

  // Simple YAML parser for our use case
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Parse arrays like ['**/*'] - extract strings between quotes
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        // Match strings within quotes, preserving content
        const stringMatches = arrayContent.match(/['"]([^'"]*)['"]/g);
        if (stringMatches) {
          value = stringMatches.map((s) => s.replace(/^['"]|['"]$/g, ''));
        } else {
          value = [];
        }
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: content.substring(match[0].length) };
}

/**
 * Strip YAML frontmatter from content
 */
function stripFrontmatter(content) {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n+/;
  return content.replace(frontmatterRegex, '');
}

/**
 * Check if globs should be treated as repository-wide (applies to all files)
 */
function isRepositoryWide(globs) {
  if (!globs || globs.length === 0) return true;
  if (globs.length === 1 && globs[0] === '**/*') return true;
  return false;
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
 * Generate GitHub Copilot instructions (repository-wide and path-specific)
 */
function generateCopilotInstructions() {
  const repositoryWideSections = [];
  const pathSpecificFiles = [];

  // Process each rule file
  for (const filename of ruleFiles) {
    const sourcePath = path.join(aiRulesDir, filename);
    try {
      const fileContent = fs.readFileSync(sourcePath, 'utf-8');
      const { frontmatter, content } = parseFrontmatter(fileContent);

      const globs = frontmatter?.globs;

      if (isRepositoryWide(globs)) {
        // Add to repository-wide instructions
        repositoryWideSections.push(content.trim());
      } else {
        // Create path-specific instruction file
        pathSpecificFiles.push({ filename, globs, content: content.trim() });
      }
    } catch (error) {
      console.error(`✗ Failed to read ${filename} for Copilot instructions:`, error.message);
    }
  }

  // Generate repository-wide .github/copilot-instructions.md
  if (repositoryWideSections.length > 0) {
    const header = `# GitHub Copilot Custom Instructions

This file provides guidance to GitHub Copilot when working with code in this repository.

`;
    const copilotContent = header + repositoryWideSections.join('\n\n');

    try {
      fs.writeFileSync(copilotInstructionsPath, copilotContent, 'utf-8');
      console.log(`✓ Generated .github/copilot-instructions.md`);
    } catch (error) {
      console.error(`✗ Failed to write .github/copilot-instructions.md:`, error.message);
    }
  }

  // Generate path-specific instruction files in .github/instructions/
  for (const { filename, globs, content } of pathSpecificFiles) {
    const baseName = filename.replace('.md', '');
    const targetFilename = `${baseName}.instructions.md`;
    const targetPath = path.join(copilotInstructionsDir, targetFilename);

    // Build frontmatter for Copilot
    // If globs is an array, use the first pattern (they're usually single patterns)
    // Join multiple patterns without spaces to preserve glob syntax
    const applyToPattern = Array.isArray(globs) ? globs[0] : globs;
    const frontmatter = `---
applyTo: "${applyToPattern}"
---

`;

    const fileContent = frontmatter + content;

    try {
      fs.writeFileSync(targetPath, fileContent, 'utf-8');
      console.log(`✓ Generated .github/instructions/${targetFilename}`);
    } catch (error) {
      console.error(`✗ Failed to write .github/instructions/${targetFilename}:`, error.message);
    }
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

console.log('Generating Cursor rules, Copilot instructions, and CLAUDE.md from ai/rules/...\n');

// Copy all rule files to .cursor/rules/
const allFiles = [...ruleFiles, ...cursorOnlyFiles];
for (const filename of allFiles) {
  copyToCursor(filename);
}

console.log('');

// Generate .github/copilot-instructions.md
generateCopilotInstructions();

console.log('');

// Generate CLAUDE.md
generateClaudeMd();

console.log('\nDone!');
console.log('- Cursor rules generated in .cursor/rules/');
console.log('- GitHub Copilot repository-wide instructions at .github/copilot-instructions.md');
console.log('- GitHub Copilot path-specific instructions in .github/instructions/');
console.log('- CLAUDE.md generated at repository root');
