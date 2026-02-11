# Notes on TypeScript usage and React types

There is no official TypeScript version support, but we try to target language features around TS 5.3 levels. There are not many big language features since, and this is about 2 years old as of writing so this is a decently safe version to target.

To accommodate older versions of React, all React code needs to follow these rules:

1. `import React from 'react'` always needs to be present in any file using JSX. This is [unnecessary in React 17 onwards using the new JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) but we don't assume the customer is using that.
2. Public facing components must either explicitly return `JSX.Element` or be typed `ComponentType`. Without them anything returning JSX is implicitly typed using 18.2's namespaced react.JSX.Element which is incompatible with older version's global JSX.Element. Using JSX.Element is forward compatible so we can still keep using it, though it looks kind of ugly
3. Components cannot return undefined. This is allowed in React 18 but will crash in earlier versions. This will not create a type error so we need to look for this manually.
