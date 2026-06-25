import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface SubscriptionRefreshContextValue {
  version: number;
  invalidate: () => void;
}

const SubscriptionRefreshContext = createContext<SubscriptionRefreshContextValue | null>(null);

export function SubscriptionRefreshProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);

  const invalidate = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo(() => ({ version, invalidate }), [version, invalidate]);

  return (
    <SubscriptionRefreshContext.Provider value={value}>
      {children}
    </SubscriptionRefreshContext.Provider>
  );
}

export function useSubscriptionRefresh(): SubscriptionRefreshContextValue {
  const context = useContext(SubscriptionRefreshContext);
  if (!context) {
    throw new Error('useSubscriptionRefresh must be used within SubscriptionRefreshProvider');
  }
  return context;
}

export function useSubscriptionRefreshVersion(): number {
  return useSubscriptionRefresh().version;
}

export function useInvalidateSubscriptions(): () => void {
  return useSubscriptionRefresh().invalidate;
}
