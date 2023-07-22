import React, {useCallback, useEffect, useState} from 'react';
import {useReceiveData} from "@/context/ReceiveContext";
import {generateKeys} from "@/components/umbra/generateSafeViewKeys";
import {Signer} from "ethers";
import {encryptPrivateViewKey} from "@/components/eth-crypto/encryptPrivateViewKey";
import {useEthersSigner} from "@/components/utils/clientToSigner";

/**
 *
 * @param {React.PropsWithChildren<IReceiveRegisterSafe>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveRegisterSafe: React.FC<IReceiveRegisterSafe> = (props) => {

  const receiveData = useReceiveData();
  const [stealthKeys, setStealthKeys] = useState<string[][]>([[]]);
  const signer = useEthersSigner();

  useEffect(() => {
    // TODO - call to check if it's initialized
  }, [receiveData.selectedSafe])

  const generateSafeKeys = useCallback( async () => {
    const keys = await generateKeys(signer as Signer)
    for (let i = 0; i < stealthKeys.length; i++) {
      const pubKeySliced = stealthKeys[i].viewingPublicKey.slice(2)
      const encryptedKey = await encryptPrivateViewKey(pubKeySliced as string, keys.viewingKeyPair.privateKeyHex as string)
      stealthKeys[i]["encryptedKey"] = encryptedKey
    }
    setStealthKeys(stealthKeys)
  }, [signer, stealthKeys]);

  return (
    <>
      {
        receiveData.isSelectedSafeInitialized
      }

    </>
  );
};

export interface IReceiveRegisterSafe {

}

export default ReceiveRegisterSafe;
