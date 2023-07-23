import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from "@mui/material";
import {useReceiveData, WithdrawSafe} from "@/context/ReceiveContext";
import {DoneAllRounded} from "@mui/icons-material";
import {theme} from "@/GlobalStyles";
import {BigNumber, ethers, Signer} from "ethers";
import {
  OperationType,
  SafeMultisigTransactionResponse,
  SafeTransactionDataPartial
} from "@safe-global/safe-core-sdk-types";
import {useEthersSigner} from "@/components/utils/clientToSigner";
import {GelatoRelayPack} from "@safe-global/relay-kit";
import Safe, {EthersAdapter, getSafeContract} from "@safe-global/protocol-kit";
import {genPersonalPrivateKeys, UmbraSafe} from "@/components/umbra/umbraExtended";
import safeService from "@/components/safe/safeEthersAdapter";
import {KeyPair} from "umbra/umbra-js/src/";

/**
 *
 * @param {React.PropsWithChildren<IWithdrawButton>} props
 * @return {JSX.Element}
 * @constructor
 */
const WithdrawButton: React.FC<IWithdrawButton> = (props) => {

  const signer = useEthersSigner();

  const [pendingSafeTxs, setPendingSafeTxs] = useState<SafeMultisigTransactionResponse[]>([]);
  const [hasCheckPendingTxsRun, setHasCheckPendingTxsRun] = useState<boolean>(false);
  const [showDialogWithMissingSigns, setShowDialogWithMissingSigns] = useState<boolean>(false);

  // checks if there are txs pending for this safe once mounted the row
  useEffect(() => {
    if (props.withdrawSafeData.stealthSafeReceiver && !props.withdrawSafeData.hasBeenExecuted)
      hasSafePendingTx().then((txsPending) => {
        setPendingSafeTxs(txsPending);
        setHasCheckPendingTxsRun(true);
      });
  }, [props.withdrawSafeData.stealthSafeReceiver]);

  // function to check if there are pending txs
  const hasSafePendingTx = useCallback(async ():  Promise<SafeMultisigTransactionResponse[]> => {
    return (await safeService.getPendingTransactions(props.withdrawSafeData.stealthSafeReceiver)).results;
  }, [props.withdrawSafeData.stealthSafeReceiver]);

  // returns the ethAdapter for the gnosis functions
  const getEthAdapter = useCallback(async (): Promise<EthersAdapter> => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm");
    const privateKey = await genPersonalPrivateKeys(signer as Signer);
    const userStealthPrivateKey = UmbraSafe.computeStealthPrivateKey(privateKey.spendingKeyPair.privateKeyHex as string, props.withdrawSafeData.randomNumber);
    const wallet = new ethers.Wallet(userStealthPrivateKey, provider);
    return new EthersAdapter({
      ethers,
      signerOrProvider: wallet
    })
  }, []);

  // sign the pending tx or show the execute button
  const signAndExecute = useCallback(async () => {
    const hasAllSignsMade = pendingSafeTxs[0].confirmations && pendingSafeTxs[0].confirmations.length >= pendingSafeTxs[0].confirmationsRequired;
    if (hasAllSignsMade) {
      const ethAdapter = await getEthAdapter();
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: props.withdrawSafeData.stealthSafeReceiver
      })
      const safeSingletonContract = await getSafeContract({ ethAdapter, safeVersion: await safeSDK.getContractVersion() })
      const pendingTx = pendingSafeTxs[0];
      const encodedTx = safeSingletonContract.encode('execTransaction', [
        pendingTx.to,
        pendingTx.value,
        pendingTx.data,
        pendingTx.operation,
        pendingTx.safeTxGas,
        pendingTx.baseGas,
        pendingTx.gasPrice,
        pendingTx.gasToken,
        pendingTx.refundReceiver,
        pendingTx.signatures  // TODO in the example was .encodedSignetures()
      ])
      const relayKit = new GelatoRelayPack()
      const options = {
        gasLimit: '200000',
      }
      const response = await relayKit.relayTransaction({
        target: props.withdrawSafeData.stealthSafeReceiver,
        encodedTransaction: encodedTx,
        chainId: 100,
        options: options
      })
    } else {
      // still sign are missing
      setShowDialogWithMissingSigns(true);
    }
  }, []);

  // launch the correct logic based on the fact that there are already txs or not
  const startWithdraw = useCallback(async () => {
    if (pendingSafeTxs.length > 0) {
      await signAndExecute();
      return;
    }
    // if we're here, means we've not yet a tx to sign
    // Any address can be used for destination. In this example, we use vitalik.eth
    const destinationAddress = '0xb250c202310da0b15b82E985a30179e74f414457'
    const amount = ethers.utils.parseUnits(props.withdrawSafeData.amount.sub(7*200000).toString(), 'ether').toString()
    const gasLimit = '200000'
    const safeTransactionData = {
      to: destinationAddress,
      data: '0x',// leave blank for native token transfers
      value: amount,
      operation: OperationType.Call
    }
    const options = {
      gasLimit,
    }
    const ethAdapter = await getEthAdapter();
    const safeSDK = await Safe.create({
      ethAdapter,
      safeAddress: props.withdrawSafeData.stealthSafeReceiver
    })
    const relayKit = new GelatoRelayPack()
    const safeTransaction = await relayKit.createRelayedTransaction(
      safeSDK,
      [safeTransactionData],
      options
    )
    const signedSafeTx = await safeSDK.signTransaction(safeTransaction)
  }, [props, pendingSafeTxs, signer]);

  return (
    <>
      {
        props.withdrawSafeData.hasBeenWithdrawn ?
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} color={theme.palette.success.main}>
            <DoneAllRounded/>
            <Typography variant={"body2"} ml={0.5}>
              Completed
            </Typography>
          </Box>
          :
          ""
      }
      {
        props.withdrawSafeData.hasBeenExecuted ?
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} justifyContent={"center"}>
            <CircularProgress size={23}/>
          </Box> : ""
      }
      {
        !props.withdrawSafeData.hasBeenWithdrawn && !props.withdrawSafeData.hasBeenExecuted ?
          <>
            <Button variant={"contained"} onClick={startWithdraw} disabled={!hasCheckPendingTxsRun}>
              Withdraw
            </Button>
            <Dialog open={showDialogWithMissingSigns}>
              <DialogTitle>
                {"Sign transaction"}
              </DialogTitle>
              <DialogContent>
                <Box display={"flex"} justifyContent={"center"} flexDirection={"column"} width={"100%"} mt={2}>
                  <Typography>
                    Confirmations {pendingSafeTxs.length > 0 && pendingSafeTxs[0].confirmations ? pendingSafeTxs[0].confirmations.length : 0} / {pendingSafeTxs.length > 0 ? pendingSafeTxs[0].confirmationsRequired : ""}
                  </Typography>
                  <Button variant={"contained"} onClick={() => {}} sx={{mt: 2}}>
                    Sign
                  </Button>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowDialogWithMissingSigns(false)}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
          :
          ""
      }
    </>
  );
};

export interface IWithdrawButton {
  withdrawSafeData: WithdrawSafe
}

export default WithdrawButton;
