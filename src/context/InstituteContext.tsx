import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { instituteApi, userInstituteAssociationApi } from '@/api';
import { useAuth } from './AuthContext';
import type { Institute, UserInstituteAssociation } from '@/types';

interface InstituteContextType {
  institute: Institute | null;
  association: UserInstituteAssociation | null;
  isLoading: boolean;
  refreshInstitute: () => Promise<void>;
}

const InstituteContext = createContext<InstituteContextType | null>(null);

export function InstituteProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [association, setAssociation] = useState<UserInstituteAssociation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInstitute = async () => {
    if (!user?.identifier) {
      setIsLoading(false);
      return;
    }
    try {
      const associations = await userInstituteAssociationApi.findByUserIdentifier(user.identifier);
      if (associations.length > 0) {
        const assoc = associations[0];
        setAssociation(assoc);
        const inst = await instituteApi.getById(assoc.instituteIdentifier);
        setInstitute(inst);
      }
    } catch (err) {
      console.error('Failed to load institute', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      loadInstitute();
    } else {
      setInstitute(null);
      setAssociation(null);
      setIsLoading(false);
    }
  }, [user?.identifier, isAuthenticated]);

  return (
    <InstituteContext.Provider
      value={{
        institute,
        association,
        isLoading,
        refreshInstitute: loadInstitute,
      }}
    >
      {children}
    </InstituteContext.Provider>
  );
}

export function useInstitute() {
  const context = useContext(InstituteContext);
  if (!context) {
    throw new Error('useInstitute must be used within an InstituteProvider');
  }
  return context;
}
