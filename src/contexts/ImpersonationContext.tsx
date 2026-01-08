import React, { createContext, useContext, useState, useCallback } from 'react';

interface ImpersonatedUser {
  id: string;
  username?: string;
  full_name?: string;
  email?: string;
  donor_id?: string;
}

interface ImpersonationContextType {
  impersonatedUser: ImpersonatedUser | null;
  isImpersonating: boolean;
  startImpersonation: (user: ImpersonatedUser) => void;
  stopImpersonation: () => void;
  /** Returns the effective user ID (impersonated or real) */
  getEffectiveUserId: (realUserId: string | null) => string | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);

  const startImpersonation = useCallback((user: ImpersonatedUser) => {
    setImpersonatedUser(user);
    console.log('[Impersonation] Started viewing as:', user);
  }, []);

  const stopImpersonation = useCallback(() => {
    console.log('[Impersonation] Stopped viewing as:', impersonatedUser);
    setImpersonatedUser(null);
  }, [impersonatedUser]);

  const getEffectiveUserId = useCallback((realUserId: string | null): string | null => {
    return impersonatedUser?.id ?? realUserId;
  }, [impersonatedUser]);

  const value = {
    impersonatedUser,
    isImpersonating: impersonatedUser !== null,
    startImpersonation,
    stopImpersonation,
    getEffectiveUserId,
  };

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};
