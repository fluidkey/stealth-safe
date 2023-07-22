// SendContext.tsx
import React, {createContext, useCallback, useContext, useState} from 'react';
import {KeyPair} from "umbra/umbra-js/src/";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getStealthKeys} from "@/components/umbra/getStealthKeys";
import {generateAddress} from "@/components/umbra/generateAddressFromKey";


type SendContextType = {
  sendTo: string;
  sendAmount: number;
  isReceiverValidAddress: boolean | undefined;
  isReceiverValidInitializedSafe: boolean | undefined;
  isStealthSafeGenerationInProgress: boolean | undefined;

  setSendTo: React.Dispatch<React.SetStateAction<string>>;
  setSendAmount: React.Dispatch<React.SetStateAction<number>>;
  setIsReceiverValidAddress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsReceiverValidInitializedSafe: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsStealthSafeGenerationInProgress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
};

// Initial state
const initialReceiveState: SendContextType = {
  sendTo: '',
  sendAmount: 0,
  isReceiverValidAddress: undefined,
  isReceiverValidInitializedSafe: undefined,
  isStealthSafeGenerationInProgress: undefined,
  setSendTo: () => {},
  setSendAmount: () => {},
  setIsReceiverValidAddress: () => {},
  setIsReceiverValidInitializedSafe: () => {},
  setIsStealthSafeGenerationInProgress: () => {}
};

// Create context
export const SendContext = createContext<SendContextType>(initialReceiveState);

// Custom hook for accessing the context
export function useSendData() {
  return useContext(SendContext);
}

// Provider component
export const SendProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [sendTo, setSendTo] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [isReceiverValidAddress, setIsReceiverValidAddress] = useState<boolean | undefined>(undefined);
  const [isReceiverValidInitializedSafe, setIsReceiverValidInitializedSafe] = useState<boolean | undefined>(undefined);
  const [isStealthSafeGenerationInProgress, setIsStealthSafeGenerationInProgress] = useState<boolean | undefined>(undefined);

  return (
    <SendContext.Provider value={{
      sendTo,
      sendAmount,
      isReceiverValidAddress,
      isReceiverValidInitializedSafe,
      isStealthSafeGenerationInProgress,
      setSendTo,
      setSendAmount,
      setIsReceiverValidAddress,
      setIsReceiverValidInitializedSafe,
      setIsStealthSafeGenerationInProgress
    }}>
      {children}
    </SendContext.Provider>
  );
};
