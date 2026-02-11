import React, { ComponentType, useEffect, useState } from 'react';

export function withSsrSafe<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  const Wrapped = (props: P) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);
    return mounted ? <Component {...props} /> : null;
  };

  Wrapped.displayName = Component.displayName ? `SsrSafe(${Component.displayName})` : 'SsrSafe';
  return Wrapped;
}
