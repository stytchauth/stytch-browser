# @stytch/js-utils

This is an internal package for use by other JS packages. It is intentionally not published to npm. This means packages importing from this package effectively _inline_ code from this package as part of their published artifacts, as if the code were duplicated in source.

Code in this package should be:

- Used in multiple packages, directly or indirectly. (Otherwise, the code can just live in the package that needs it.)
- Not sensitive to identity. For example, `Error` classes are often used in conjunction with `instanceof` checks which are sensitive to the identity of the class. Error classes referenced in multiple packages should live in `@stytch/core` instead.
- Small enough that duplication is immaterial, or only used in such a way that duplication is not a concern.
  - For example, if code is shared between the `@stytch/react`, `@stytch/react-native` and `@stytch/nextjs` packages, duplication is not a practical concern because consumers would only be expected to use one of those packages at a time.
  - However, if code is shared between `@stytch/vanilla-js` and `@stytch/react`, consumers might use both of these packages, meaning the code would be duplicated between them. Unless the duplication is small enough to be immaterial, the code should live elsewhere (such as `@stytch/vanilla-js` or `@stytch/core`).
- Free of dependencies, unless those dependencies also meet the above criteria.
