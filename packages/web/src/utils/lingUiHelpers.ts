/* eslint-disable lingui/no-unlocalized-strings */

export interface MessageEntry {
  msgid: string;
  msgstr: string;
}

export function unescapePoString(str: string): string {
  return str.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export function parsePoFile(content: string): string[] {
  const keys: string[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('msgid ')) {
      const match = trimmed.match(/^msgid\s+"(.*)"$/);
      if (!match) continue;
      const unescaped = unescapePoString(match[1]);
      if (unescaped) keys.push(unescaped);
    }
  }

  return keys;
}

export function generateTypeScriptTypes(messages: string[]): string {
  const keys = [...messages].sort();
  const quotedKeys = keys.map((key) => `"${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);

  let typeDefinition = `// This file is auto-generated. Do not edit manually.\n\n`;
  typeDefinition += `export type MessageKey = ${keys.length === 0 ? 'never' : quotedKeys.join(' | ')};`;
  typeDefinition += `export type Messages = Partial<Record<MessageKey, string>>;`;
  return typeDefinition;
}
