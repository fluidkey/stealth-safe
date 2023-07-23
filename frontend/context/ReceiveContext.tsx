// ReceiveContext.tsx
import React, {createContext, useCallback, useContext, useState} from 'react';
import {KeyPair} from "umbra/umbra-js/src/";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getStealthKeys} from "@/components/umbra/getStealthKeys";
import {generateAddress} from "@/components/umbra/generateAddressFromKey";
import {BigNumber} from "ethers";

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

export interface WithdrawSafe {
  date: number,
  amount: BigNumber,
  sender: string,
  randomNumber: string,
  stealthSafeReceiver: string,
  hasBeenInitiated: boolean,
  hasBeenExecuted: boolean,
  hasBeenWithdrawn: boolean
}

type ReceiveContextType = {
  safes: string[];
  selectedSafe: string;
  selectedSafeOwners: string[];
  ownersStealthKeys: UserStealthAddress[];
  safeViewKey: SafeViewKey | undefined;
  areAllSafeOwnersInitialized: boolean | undefined;
  isSelectedSafeInitialized: boolean | undefined;
  withdrawSafeList: WithdrawSafe[];

  setSafes: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSafe: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSafeOwners: React.Dispatch<React.SetStateAction<string[]>>;
  setOwnersStealthKeys: React.Dispatch<React.SetStateAction<UserStealthAddress[]>>;
  setSafeViewKey: React.Dispatch<React.SetStateAction<SafeViewKey | undefined>>;
  setAreAllSafeOwnersInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsSelectedSafeInitialized: React.Dispatch<React.SetStateAction<boolean | undefined>>;

  fetchSafeInfo: () => Promise<void>;
  overwriteWithdrawSafeList: (list: WithdrawSafe[]) => void;
  changeWithdrawSafe: (pos: number, ws: WithdrawSafe) => void;
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
  withdrawSafeList: [],
  setSafes: () => {},
  setSelectedSafe: () => {},
  setSelectedSafeOwners: () => {},
  setOwnersStealthKeys: () => {},
  setSafeViewKey: () => {},
  setAreAllSafeOwnersInitialized: () => {},
  setIsSelectedSafeInitialized: () => {},
  fetchSafeInfo: async () => {},
  overwriteWithdrawSafeList: () => {},
  changeWithdrawSafe: () => {},
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
  const [withdrawSafeList, setWithdrawSafeList] = useState<WithdrawSafe[]>([]);
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

  // necessary to change the withdraw status
  const changeWithdrawSafe = useCallback((pos: number, ws: WithdrawSafe) => {
    if (pos<0 || pos >= withdrawSafeList.length) return;
    const wsList = JSON.parse(JSON.stringify(withdrawSafeList));
    wsList[pos] = ws;
    setWithdrawSafeList(wsList);
  }, []);

  // overrides the whole list with the given one
  const overwriteWithdrawSafeList = useCallback((_newWithdrawList: WithdrawSafe[]) => {
    setWithdrawSafeList(_newWithdrawList);
  }, [setWithdrawSafeList]);

  return (
    <ReceiveContext.Provider value={{
      safes,
      selectedSafe,
      selectedSafeOwners,
      ownersStealthKeys,
      safeViewKey,
      areAllSafeOwnersInitialized,
      isSelectedSafeInitialized,
      withdrawSafeList,
      setSafes,
      setSelectedSafe,
      setSelectedSafeOwners,
      setOwnersStealthKeys,
      setSafeViewKey,
      setAreAllSafeOwnersInitialized,
      setIsSelectedSafeInitialized,
      fetchSafeInfo,
      changeWithdrawSafe,
      overwriteWithdrawSafeList
    }}>
      {children}
    </ReceiveContext.Provider>
  );
};
