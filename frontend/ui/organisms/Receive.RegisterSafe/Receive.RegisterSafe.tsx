import React, {useCallback, useEffect, useState} from 'react';
import {SafeViewKey, useReceiveData, UserStealthAddress} from "@/context/ReceiveContext";
import {generateKeys} from "@/components/umbra/generateSafeViewKeys";
import {Signer} from "ethers";
import {encryptPrivateViewKey} from "@/components/eth-crypto/encryptPrivateViewKey";
import {useEthersSigner} from "@/components/utils/clientToSigner";
import {useAccount, useContractRead} from "wagmi";
import {SAFE_VIEW_KEY_REGISTRY_ABI, SAFE_VIEW_KEY_REGISTRY_ADDRESS} from "@/components/Const";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, IconButton, Typography
} from "@mui/material";
import Link from "next/link";
import {addSafe} from "@/components/safeKeyRegistry/addSafe";
import {useRouter} from "next/router";
import SuccessInitialized from "@/ui/organisms/Receive.RegisterSafe/SuccessInitialized";
import {RefreshRounded} from "@mui/icons-material";

/**
 *
 * @param {React.PropsWithChildren<IReceiveRegisterSafe>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveRegisterSafe: React.FC<IReceiveRegisterSafe> = (props) => {

  const receiveData = useReceiveData();
  const signer = useEthersSigner();
  const { address } = useAccount();
  const router = useRouter();


  const [showDialogToInitialize, setShowDialogToInitialize] = useState<boolean>(false);
  const [internalInitializationState, setInternalInitializationState] = useState<"none" | "sending" | "sent">("none");

  const readStealthSafeKeys = useContractRead({
    address: SAFE_VIEW_KEY_REGISTRY_ADDRESS,
    abi: SAFE_VIEW_KEY_REGISTRY_ABI,
    functionName: 'stealthKeys',
    args: [receiveData.selectedSafe],
    watch: true
  });

  // check if safe is initialized or not once the read call to VIEW_KEY_SAFE_REGISTRY_ADDRESS is over
  useEffect(() => {
    if (readStealthSafeKeys.isSuccess) {
      const viewingSafePubKey = (readStealthSafeKeys.data as any)[1] as BigInt;
      if (viewingSafePubKey === BigInt(0)) {
        setShowDialogToInitialize(true);
        receiveData.setIsSelectedSafeInitialized(false);
      } else {
        setShowDialogToInitialize(false);
        receiveData.setIsSelectedSafeInitialized(true);
      }
    }
  }, [readStealthSafeKeys.isSuccess]);

  // generate the view keys for the Stealth registry, encrypting for the owners of the safe
  const generateSafeKeys = useCallback( async (): Promise<{ safeKeys: SafeViewKey, ownersKeys: UserStealthAddress[] }> => {
    const keys = await generateKeys(signer as Signer)
    const _tmpOwnersStealthKeys = JSON.parse(JSON.stringify(receiveData.ownersStealthKeys));
    for (let i = 0; i < _tmpOwnersStealthKeys.length; i++) {
      const pubKeySliced = _tmpOwnersStealthKeys[i].viewingPublicKey.slice(2)
      const encryptedKey = await encryptPrivateViewKey(pubKeySliced as string, keys.viewingKeyPair.privateKeyHex as string)
      _tmpOwnersStealthKeys[i]["safeStealthViewPrivateEncKey"] = "0x"+encryptedKey
    }
    receiveData.setOwnersStealthKeys(_tmpOwnersStealthKeys);
    receiveData.setSafeViewKey(keys);
    return {safeKeys: keys, ownersKeys: _tmpOwnersStealthKeys};
  }, [signer, receiveData]);

  // initialize the Safe by registering in the Stealth Key Vew Registry
  const initializeSafe = useCallback(async () => {
    setInternalInitializationState("sending");
    const generateSafeKeysResp = await generateSafeKeys();
    await addSafe(
      receiveData.selectedSafe,
      address as string,
      generateSafeKeysResp.safeKeys.prefix,
      generateSafeKeysResp.safeKeys.pubKeyXCoordinate,
      generateSafeKeysResp.ownersKeys.map((key) => [key.safeStealthViewPrivateEncKey as string, key.owner]),
      signer as Signer)
    setInternalInitializationState("sent");
  }, [generateSafeKeys, receiveData.selectedSafe]);


  return (
    <>
      {
        receiveData.isSelectedSafeInitialized ?
          <SuccessInitialized/>
          :
          <>
            <Box display={"flex"} alignItems={"center"}>
              <Alert severity="warning"
                     action={
                       <Button color="inherit" size="small" onClick={() => setShowDialogToInitialize(true)}>
                         Initialize
                       </Button>
                     }
              >
                You need to initialize the Safe
              </Alert>
              <IconButton size="small" style={{marginLeft: 8}} onClick={() => receiveData.fetchSafeInfo().then()}>
                <RefreshRounded fontSize="inherit" />
              </IconButton>
            </Box>
            <Dialog open={showDialogToInitialize}>
              <DialogTitle>
                {"Register Safe"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  You need to Register the Safe in the Safe Stealth View Key Registry.
                </DialogContentText>
                <DialogContentText style={{marginTop: 4}}>
                  This operation needs to be done once, and allows anyone to send you funds using Stealth Safe mechanism.
                </DialogContentText>
                <Box display={"flex"} justifyContent={"center"} width={"100%"} mt={2}>
                  {
                    internalInitializationState === "none" ? (
                      <Button variant={"contained"} onClick={initializeSafe}>
                        Initialize Safe
                      </Button>
                    )
                    :
                    internalInitializationState === "sending" ? (
                      <CircularProgress/>
                    )
                      :
                    (
                      <Alert severity="success"
                             action={
                               <Button color="inherit"
                                       size="small"
                                       onClick={() => window.open(`https://app.safe.global/transactions/queue?safe=gno:${receiveData.selectedSafe}`)}>
                                 Go to Gnosis
                               </Button>
                             }
                      >
                        Transaction sent! Go to Safe App to confirm it
                      </Alert>
                    )
                  }
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  if (internalInitializationState === "sent") receiveData.fetchSafeInfo().then();
                  setShowDialogToInitialize(false);
                }}
                        disabled={internalInitializationState === "sending"}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
      }

    </>
  );
};

export interface IReceiveRegisterSafe {

}

export default ReceiveRegisterSafe;
