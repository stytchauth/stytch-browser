import { types as t, template } from '@babel/core';
import chroma from 'chroma-js';
import { parse as parsePath } from 'node:path';

// Some color icons have elements that need to be inverted in dark mode
// like the a in Amazon or the entire GitHub icon. This script checks for <path>
// element fill attributes, look for very dark colors, and insert a style that applied
// an invert() filter when in dark mode (themes declaring 'color-scheme': 'dark').

const elementsAllowList = ['path'];

// Files to ignore
// - the Metamask icon have dark elements but those should not become white in dark mode
const ignoreFiles = ['metamask'];

// Files in which all paths are inverted
// - the Snapchat icon requires both the outline and fill to be inverted in dark mode
const invertAllPathsInFiles = ['snapchat'];

// Only run this plugin on fill="#..." attributes where the color don't have enough contrast
// with a dark background
function isDarkFillAttribute(attribute) {
  if (!attribute.isJSXAttribute() || !attribute.get('name').isJSXIdentifier({ name: 'fill' })) {
    return false;
  }

  const valuePath = attribute.get('value');
  if (!valuePath.isStringLiteral()) {
    return false;
  }

  const color = valuePath.node.value;
  // There are other fill values that are not colors
  if (!chroma.valid(color)) {
    return false;
  }

  return chroma.contrast(color, '#000') < 2;
}

const updateDarkFillAttribute = () => ({
  visitor: {
    JSXOpeningElement(path, state) {
      const filename = state.file.opts.filename;
      const parsed = parsePath(filename);

      // Only run this on color icons
      if (!filename.includes('/logo-color/') || ignoreFiles.includes(parsed.name)) {
        return;
      }

      if (!t.isJSXIdentifier(path.node.name)) return;
      if (!elementsAllowList.includes(path.node.name.name)) return;

      // Check if this path is eligible
      const invertAll = invertAllPathsInFiles.includes(parsed.name);
      const darkFill = path.get('attributes').find(isDarkFillAttribute);
      if (!invertAll && !darkFill) return;

      // Add the className attribute
      const newAttribute = t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.jsxExpressionContainer(template.ast('_styles.darkInvert').expression),
      );

      path.pushContainer('attributes', newAttribute);

      if (invertAll) {
        console.log('Adding darkInvert to all paths in', parsed.name);
      } else {
        console.log('Adding darkInvert style', darkFill.get('value').node.value.padEnd(7), 'in', parsed.name);
      }
    },
  },
});

export default updateDarkFillAttribute;
