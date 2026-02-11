import { generateTypeScriptTypes, parsePoFile, unescapePoString } from './lingUiHelpers';

describe('unescapePoString', () => {
  it('should unescape newlines', () => {
    expect(unescapePoString('Hello\\nWorld')).toBe('Hello\nWorld');
  });

  it('should unescape tabs', () => {
    expect(unescapePoString('Hello\\tWorld')).toBe('Hello\tWorld');
  });

  it('should unescape quotes', () => {
    expect(unescapePoString('Hello\\"World\\"')).toBe('Hello"World"');
  });

  it('should unescape backslashes', () => {
    expect(unescapePoString('Hello\\\\World')).toBe('Hello\\World');
  });

  it('should handle multiple escape sequences', () => {
    expect(unescapePoString('Line1\\nLine2\\tTabbed')).toBe('Line1\nLine2\tTabbed');
  });
});

describe('parsePoFile', () => {
  it('should parse a simple .po file', () => {
    const poContent = `msgid ""
msgstr ""
"POT-Creation-Date: 2025-01-01 12:00-0000\\n"

msgid "button.cancel"
msgstr "Cancel"

msgid "button.continue"
msgstr "Continue"
`;

    const entries = parsePoFile(poContent);

    expect(entries).toEqual(['button.cancel', 'button.continue']);
  });

  it('should handle escaped characters in strings', () => {
    const poContent = `msgid "message \\"escaped\\""
msgstr "Hello World Tabbed"
`;

    const entries = parsePoFile(poContent);
    expect(entries).toEqual(['message "escaped"']);
  });
});

describe('generateTypeScriptTypes', () => {
  it('should generate types for messages', () => {
    const messages = ['button.cancel', 'button.continue', 'button.save'];

    const content = generateTypeScriptTypes(messages);
    expect(content).toContain('export type MessageKey = "button.cancel" | "button.continue" | "button.save";');
  });

  it('should generate types in sorted order', () => {
    const messages = ['button.z', 'button.a', 'button.m'];

    const content = generateTypeScriptTypes(messages);
    expect(content).toContain('export type MessageKey = "button.a" | "button.m" | "button.z";');
  });

  it('should handle empty messages', () => {
    const messages: string[] = [];

    const content = generateTypeScriptTypes(messages);
    expect(content).toContain('export type MessageKey = never;');
  });

  it('should handle quotation marks in messages', () => {
    const messages = ['message "escaped"'];

    const content = generateTypeScriptTypes(messages);
    expect(content).toContain('export type MessageKey = "message \\"escaped\\"";');
  });

  it('should include auto-generated comment', () => {
    const messages = ['button.cancel'];

    const content = generateTypeScriptTypes(messages);
    expect(content).toContain('// This file is auto-generated. Do not edit manually.');
  });
});
