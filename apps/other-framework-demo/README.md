# other-framework-demo

Demo and test app for `@stytch/vanilla-js`, testing non-framework and non-React framework code.

Each folder under `src` contains a set of files running a basic Stytch UI component. The demos test the following

- Properties like `config` are correctly bindable using framework native syntax via custom element properties
- The component correctly updates when given new property values
- Events are fired correctly and can be listened to via framework native syntax
- Tree shaking works as expected

Development build runs a single Vite config while prod builds each page separately so the final bundle size for each framework can be checked.
