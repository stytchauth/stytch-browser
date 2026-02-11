import { B2BState, ConsumerState } from './public';

// We should try refreshing the session if there exists a cached session in
// state that might be stale. Otherwise, we know there is no session, so there's
// no need.
export const shouldTryRefresh = <T extends ConsumerState | B2BState>(state: T | null) => !!state?.session;
