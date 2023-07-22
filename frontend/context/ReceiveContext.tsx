// ReceiveContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface UserStealthAddress {
  owner: string;
  address: string;
  spendingPublicKey: string;
  viewingPublicKey: string;
}

type ReceiveContextType = {
  safes: string[];
  selectedSafe: string;
  selectedSafeOwners: string[];
  ownersStealthKeys: UserStealthAddress[];
  areAllSafeOwnersInitialized: boolean | undefined;
  isSelectedSafeInitialized: boolean | undefined;

  setSafes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSafe: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSafeOwners: React.Dispatch<React.SetStateAction<string[]>>;
  setOwnersStealthKeys: React.Dispatch<React.SetStateAction<UserStealthAddress[]>>;
  setAreAllSafeOwnersInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsSelectedSafeInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;
};

// Initial state
const initialReceiveState: ReceiveContextType = {
  safes: [],
  selectedSafe: '',
  selectedSafeOwners: [],
  ownersStealthKeys: [],
  areAllSafeOwnersInitialized: undefined,
  isSelectedSafeInitialized: undefined,
  setSafes: () => {},
  setSelectedSafe: () => {},
  setSelectedSafeOwners: () => {},
  setOwnersStealthKeys: () => {},
  setAreAllSafeOwnersInitialized: () => {},
  setIsSelectedSafeInitialized: () => {},
};

// Create context
export const ReceiveContext = createContext<ReceiveContextType>(initialReceiveState);

// Custom hook for accessing the context
export function useReceiveData() {
  return useContext(ReceiveContext);
}

// Provider component
export const ReceiveProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [safes, setSafes] = useState<string[]>([]);
  const [selectedSafe, setSelectedSafe] = useState<string>('');
  const [selectedSafeOwners, setSelectedSafeOwners] = useState<string[]>([]);
  const [ownersStealthKeys, setOwnersStealthKeys] = useState<UserStealthAddress[]>([]);
  const [areAllSafeOwnersInitialized, setAreAllSafeOwnersInitialized] = useState<boolean | undefined>(undefined);
  const [isSelectedSafeInitialized, setIsSelectedSafeInitialized] = useState<boolean | undefined>(undefined);

  return (
    <ReceiveContext.Provider value={{
      safes,
      selectedSafe,
      selectedSafeOwners,
      ownersStealthKeys,
      areAllSafeOwnersInitialized,
      isSelectedSafeInitialized,
      setSafes,
      setSelectedSafe,
      setSelectedSafeOwners,
      setOwnersStealthKeys,
      setAreAllSafeOwnersInitialized,
      setIsSelectedSafeInitialized
    }}>
      {children}
    </ReceiveContext.Provider>
  );
};
