import path from 'path';
import fs from 'fs';
import MagicString from 'magic-string';

/**
 * Walk the given node to find all simple `require` calls
 *
 * @param {import('estree').Node} node
 * @returns {IterableIterator<import('estree').CallExpression & {
 *   start: number,
 *   end: number,
 *   arguments: [import('estree').SimpleLiteral & { value: string }]
 * }>}
 */
const findRequireNodes = function* (node) {
  if (
    node.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments?.length === 1 &&
    node.arguments[0]?.type === 'Literal' &&
    typeof node.arguments[0].value === 'string' &&
    /\.(png|jpg|jpeg|gif)$/i.test(node.arguments[0].value)
  ) {
    if (typeof node.start !== 'number' || typeof node.end !== 'number') {
      throw new Error('Node has no start or end property');
    }

    yield node;
  }

  if (typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value) {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item) {
              yield* findRequireNodes(item);
            }
          }
        } else if (typeof value === 'object') {
          yield* findRequireNodes(value);
        }
      }
    }
  }
};

/**
 * A custom Rollup plugin to handle React Native image assets that use `require`:
 * - Required assets are emitted as part of the output
 * - Require paths are rewritten to point to the correct location in the output
 *
 * @returns {import('rollup').Plugin}
 */
export function imageAssetPlugin() {
  return {
    name: 'image-asset-plugin',
    async transform(code, id) {
      if (!/\.(jsx?|tsx?)$/.test(id)) {
        return null;
      }

      const ast = this.parse(code);
      const magicString = new MagicString(code);

      for (const node of findRequireNodes(ast)) {
        const requirePath = node.arguments[0].value;
        if (!requirePath.endsWith('.png')) {
          continue;
        }

        const importingDir = path.dirname(id);
        const assetPath = path.resolve(importingDir, requirePath);
        const source = fs.readFileSync(assetPath);

        const referenceId = this.emitFile({
          type: 'asset',
          name: path.basename(assetPath),
          originalFileName: assetPath,
          source,
          needsCodeReference: true,
        });

        magicString.overwrite(node.start, node.end, `require(import.meta.ROLLUP_FILE_URL_${referenceId})`);
      }

      if (magicString.hasChanged()) {
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }

      return null;
    },

    resolveFileUrl({ relativePath, format }) {
      if (format === 'cjs') {
        return `'./${relativePath}'`;
      }
    },
  };
}
