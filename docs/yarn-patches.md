Documentation for patches in .yarn/patches

See https://yarnpkg.com/features/patching and https://yarnpkg.com/cli/patch for how to write yarn patches.

## @radix-ui/react-roving-focus

react-roving-focus won't work correctly in Shadow DOM since it relies on `document.activeElement` which points to the
shadow root parent when the focus is on an element inside a shadow DOM. This sort of makes sense but it breaks logic in
how the library tries to check if it had updated focus. We've added a function to recursively look for the correct
focused element if activeElement points to a shadow DOM parent.
