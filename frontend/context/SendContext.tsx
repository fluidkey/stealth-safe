// SendContext.tsx
import React, {createContext, useCallback, useContext, useState} from 'react';
import {KeyPair} from "umbra/umbra-js/src/";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getStealthKeys} from "@/components/umbra/getStealthKeys";
import {generateAddress} from "@/components/umbra/generateAddressFromKey";
import {getSafe} from "@/components/safeKeyRegistry/getSafe";
import {prepareSendToSafe} from "@/components/umbra/umbraExtended";
import {SafeInfoResponse} from "@safe-global/api-kit";
import {BigNumber} from "ethers";

export interface SafeStealthData {
  recipientId: string,
  stealthKeyPair: any,
  pubKeyXCoordinate: any,
  encryptedRandomNumber: any,
  stealthAddress: string
}

export enum SendTransactionStep {
  None,
  StealthSafeGenerated,
  FundsSent
}

type SendContextType = {
  sendTo: string;
  sendAmount: number;
  safeInfo: SafeInfoResponse | undefined;
  safeStealthDataList: SafeStealthData[];
  generatedSafeStealthAddress: string;
  sendTransactionCurrentStep: SendTransactionStep
  isReceiverValidAddress: boolean | undefined;
  isReceiverValidInitializedSafe: boolean | undefined;
  isStealthSafeGenerationInProgress: boolean | undefined;
  isSendFundInProgress: boolean;

  setSendTo: React.Dispatch<React.SetStateAction<string>>;
  setSendAmount: React.Dispatch<React.SetStateAction<number>>;
  setGeneratedSafeStealthAddress: React.Dispatch<React.SetStateAction<string>>;
  setSendTransactionCurrentStep: React.Dispatch<React.SetStateAction<SendTransactionStep>>;
  setIsReceiverValidAddress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsReceiverValidInitializedSafe: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsStealthSafeGenerationInProgress: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setIsSendFundInProgress: React.Dispatch<React.SetStateAction<boolean>>;

  fetchSafeInfo: () => Promise<{ safeInfo: SafeInfoResponse | undefined, safeStealthDataList: SafeStealthData[] } | undefined>;
};

// Initial state
const initialReceiveState: SendContextType = {
  sendTo: '',
  sendAmount: 0,
  safeInfo: undefined,
  safeStealthDataList: [],
  generatedSafeStealthAddress: '',
  sendTransactionCurrentStep: SendTransactionStep.None,
  isReceiverValidAddress: undefined,
  isReceiverValidInitializedSafe: undefined,
  isStealthSafeGenerationInProgress: undefined,
  isSendFundInProgress: false,
  setSendTo: () => {},
  setSendAmount: () => {},
  setGeneratedSafeStealthAddress: () => {},
  setSendTransactionCurrentStep: () => {},
  setIsReceiverValidAddress: () => {},
  setIsReceiverValidInitializedSafe: () => {},
  setIsStealthSafeGenerationInProgress: () => {},
  setIsSendFundInProgress: () => {},
  fetchSafeInfo: async () => undefined
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
  const [safeInfo, setSafeInfo] = useState<SafeInfoResponse | undefined>(undefined);
  const [safeStealthDataList, setSafeStealthDataList] = useState<SafeStealthData[]>([]);
  const [generatedSafeStealthAddress, setGeneratedSafeStealthAddress] = useState<string>('');
  const [sendTransactionCurrentStep, setSendTransactionCurrentStep] = useState<SendTransactionStep>(SendTransactionStep.None);
  const [isReceiverValidAddress, setIsReceiverValidAddress] = useState<boolean | undefined>(undefined);
  const [isReceiverValidInitializedSafe, setIsReceiverValidInitializedSafe] = useState<boolean | undefined>(undefined);
  const [isStealthSafeGenerationInProgress, setIsStealthSafeGenerationInProgress] = useState<boolean | undefined>(undefined);
  const [isSendFundInProgress, setIsSendFundInProgress] = useState<boolean>(false);

  // get the basic information from a safe to understand if it's a stealth safe
  const fetchSafeInfo = useCallback(async (): Promise<{ safeInfo: SafeInfoResponse | undefined, safeStealthDataList: SafeStealthData[] } | undefined> => {
    if (!isReceiverValidAddress) return;
    setIsStealthSafeGenerationInProgress(true);
    let safeInfo;
    try {
      safeInfo = await getSafeInfo(sendTo);
    } catch (error) {
      setIsStealthSafeGenerationInProgress(false);
      setIsReceiverValidInitializedSafe(false);
      return;
    }
    setSafeInfo(safeInfo);
    const { viewingPubKey, viewingPubKeyPrefix} = await getSafe(safeInfo.address);
    // it's a safe but not initialized
    if (BigNumber.from(0).eq(viewingPubKey)) {
      setIsReceiverValidInitializedSafe(false);
      setIsStealthSafeGenerationInProgress(false);
      return;
    }
    const getStealthData = await prepareSendToSafe(safeInfo.owners, viewingPubKey, viewingPubKeyPrefix);
    setIsReceiverValidInitializedSafe(true);
    setSafeStealthDataList(getStealthData);
    setSendTransactionCurrentStep(SendTransactionStep.StealthSafeGenerated);
    return {
      safeInfo,
      safeStealthDataList: getStealthData
    }
  }, [sendTo, isReceiverValidAddress, getSafe, prepareSendToSafe]);

  return (
    <SendContext.Provider value={{
      sendTo,
      sendAmount,
      safeInfo,
      safeStealthDataList,
      generatedSafeStealthAddress,
      sendTransactionCurrentStep,
      isReceiverValidAddress,
      isReceiverValidInitializedSafe,
      isStealthSafeGenerationInProgress,
      isSendFundInProgress,

      setSendTo,
      setSendAmount,
      setGeneratedSafeStealthAddress,
      setSendTransactionCurrentStep,
      setIsReceiverValidAddress,
      setIsReceiverValidInitializedSafe,
      setIsStealthSafeGenerationInProgress,
      setIsSendFundInProgress,

      fetchSafeInfo
    }}>
      {children}
    </SendContext.Provider>
  );
};
