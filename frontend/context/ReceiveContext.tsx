// ReceiveContext.tsx
import React, { createContext, useContext, useState } from 'react';

type ReceiveContextType = {
  safes: string[];
  selectedSafe: string;
  setSafes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSafe: React.Dispatch<React.SetStateAction<string>>;
};

// Initial state
const initialReceiveState: ReceiveContextType = {
  safes: [],
  selectedSafe: '',
  setSafes: () => {},
  setSelectedSafe: () => {},
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

  return (
    <ReceiveContext.Provider value={{ safes, selectedSafe, setSafes, setSelectedSafe }}>
      {children}
    </ReceiveContext.Provider>
  );
};
