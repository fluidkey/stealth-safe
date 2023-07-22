// ReceiveContext.tsx
import React, {createContext, useCallback, useContext, useState} from 'react';
import {KeyPair} from "umbra/umbra-js/src/";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getStealthKeys} from "@/components/umbra/getStealthKeys";
import {generateAddress} from "@/components/umbra/generateAddressFromKey";

export interface UserStealthAddress {
  owner: string;
  address: string;
  spendingPublicKey: string;
  viewingPublicKey: string;
  safeStealthViewPrivateEncKey?: string
}

export interface SafeViewKey {
  viewingKeyPair: KeyPair,
  prefix: number,
  pubKeyXCoordinate: string
}

type ReceiveContextType = {
  safes: string[];
  selectedSafe: string;
  selectedSafeOwners: string[];
  ownersStealthKeys: UserStealthAddress[];
  safeViewKey: SafeViewKey | undefined;
  areAllSafeOwnersInitialized: boolean | undefined;
  isSelectedSafeInitialized: boolean | undefined;

  setSafes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSafe: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSafeOwners: React.Dispatch<React.SetStateAction<string[]>>;
  setOwnersStealthKeys: React.Dispatch<React.SetStateAction<UserStealthAddress[]>>;
  setSafeViewKey: React.Dispatch<React.SetStateAction<SafeViewKey | undefined>>;
  setAreAllSafeOwnersInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsSelectedSafeInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;

  fetchSafeInfo: () => Promise<void>
};

// Initial state
const initialReceiveState: ReceiveContextType = {
  safes: [],
  selectedSafe: '',
  selectedSafeOwners: [],
  ownersStealthKeys: [],
  safeViewKey: undefined,
  areAllSafeOwnersInitialized: undefined,
  isSelectedSafeInitialized: undefined,
  setSafes: () => {},
  setSelectedSafe: () => {},
  setSelectedSafeOwners: () => {},
  setOwnersStealthKeys: () => {},
  setSafeViewKey: () => {},
  setAreAllSafeOwnersInitialized: () => {},
  setIsSelectedSafeInitialized: () => {},
  fetchSafeInfo: async () => {}
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
  const [safeViewKey, setSafeViewKey] = useState<SafeViewKey | undefined>(undefined);
  const [areAllSafeOwnersInitialized, setAreAllSafeOwnersInitialized] = useState<boolean | undefined>(undefined);
  const [isSelectedSafeInitialized, setIsSelectedSafeInitialized] = useState<boolean | undefined>(undefined);

  // retrieve the info of the safe and of the owners of it
  const fetchSafeInfo = useCallback(async () => {
    setSelectedSafeOwners([]);
    setAreAllSafeOwnersInitialized(undefined);
    setOwnersStealthKeys([]);
    const safeInfo = await getSafeInfo(selectedSafe)
    const owners = safeInfo.owners;
    setSelectedSafeOwners(owners);
    let safeStealthKeysArray: any = []
    for (let i = 0; i < owners.length; i++) {
      const safeStealthKeys = await getStealthKeys(owners[i]) as any
      if (safeStealthKeys.error) {
        setAreAllSafeOwnersInitialized(false);
        console.log("Make sure all owners have registered their stealth keys.");
        return;
      } else {
        setAreAllSafeOwnersInitialized(true);
        safeStealthKeys["owner"] = owners[i]
        safeStealthKeys["address"] = await generateAddress(safeStealthKeys.viewingPublicKey)
        safeStealthKeysArray.push(safeStealthKeys)
      }
    }
    setOwnersStealthKeys(safeStealthKeysArray);
  }, [selectedSafe, getSafeInfo, getStealthKeys, generateAddress]);

  return (
    <ReceiveContext.Provider value={{
      safes,
      selectedSafe,
      selectedSafeOwners,
      ownersStealthKeys,
      safeViewKey,
      areAllSafeOwnersInitialized,
      isSelectedSafeInitialized,
      setSafes,
      setSelectedSafe,
      setSelectedSafeOwners,
      setOwnersStealthKeys,
      setSafeViewKey,
      setAreAllSafeOwnersInitialized,
      setIsSelectedSafeInitialized,
      fetchSafeInfo
    }}>
      {children}
    </ReceiveContext.Provider>
  );
};
