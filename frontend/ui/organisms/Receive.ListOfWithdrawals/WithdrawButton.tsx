import React, {useCallback, useEffect, useState} from 'react';
import {
  accordionClasses,
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
import {ProposeTransactionProps} from "@safe-global/api-kit";
import {useAccount} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<IWithdrawButton>} props
 * @return {JSX.Element}
 * @constructor
 */
const WithdrawButton: React.FC<IWithdrawButton> = (props) => {

  const signer = useEthersSigner();
  const account = useAccount();

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
      console.log("pendingTx", pendingTx);
      console.log("full arrat", [
        pendingTx.to,
        pendingTx.value,
        "0x",
        pendingTx.operation,
        pendingTx.safeTxGas,
        pendingTx.baseGas,
        pendingTx.gasPrice,
        pendingTx.gasToken,
        pendingTx.refundReceiver,
        // @ts-ignore
        pendingTx.confirmations[0].signature
      ]);
      const encodedTx = safeSingletonContract.encode('execTransaction', [
        pendingTx.to,
        pendingTx.value,
        "0x",
        pendingTx.operation,
        pendingTx.safeTxGas,
        pendingTx.baseGas,
        pendingTx.gasPrice,
        pendingTx.gasToken,
        pendingTx.refundReceiver,
        // @ts-ignore
        pendingTx.confirmations[0].signature
      ])
      const relayKit = new GelatoRelayPack()
      const options = {
        gasLimit: '500000'
      }
      console.log("encodedTx", encodedTx);
      const response = await relayKit.relayTransaction({
        target: props.withdrawSafeData.stealthSafeReceiver,
        encodedTransaction: encodedTx,
        chainId: 100,
        options: options
      })
      console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`)
    } else {
      // still sign are missing
      setShowDialogWithMissingSigns(true);
    }
  }, [pendingSafeTxs, getEthAdapter, props, getSafeContract]);

  // launch the correct logic based on the fact that there are already txs or not
  const startWithdraw = useCallback(async () => {
    // if (pendingSafeTxs.length > 0) {
    //   await signAndExecute();
    //   return;
    // }

    // if we're here, means we've not yet a tx to sign
    // Any address can be used for destination. In this example, we use vitalik.eth
    const destinationAddress = '0xb250c202310da0b15b82E985a30179e74f414457'
    const amount = props.withdrawSafeData.amount.toString();
    const gasLimit = '500000'
    const safeTransactionData = {
      to: destinationAddress,
      data: '0x',// leave blank for native token transfers
      value: amount,
      operation: OperationType.Call
    }
    const options = {
      gasLimit
    }
    // const ethAdapter = await getEthAdapter();
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm");
    const privateKey = await genPersonalPrivateKeys(signer as Signer);
    const userStealthPrivateKey = UmbraSafe.computeStealthPrivateKey(privateKey.spendingKeyPair.privateKeyHex as string, props.withdrawSafeData.randomNumber);
    const wallet = new ethers.Wallet(userStealthPrivateKey, provider);
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: wallet
    });
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

    console.log("wallet.getAddress()", await wallet.getAddress());

    const transactionConfig = {
      safeAddress: props.withdrawSafeData.stealthSafeReceiver,
      safeTransactionData: safeTransaction.data,
      safeTxHash: await safeSDK.getTransactionHash(safeTransaction),
      senderAddress: await wallet.getAddress(),
      senderSignature: signedSafeTx.encodedSignatures(),
      origin: "withdraw"
    } as unknown as ProposeTransactionProps

    const propose = await safeService.proposeTransaction(transactionConfig)

  }, [props, pendingSafeTxs, signer, account]);

  // launch the correct logic based on the fact that there are already txs or not
  const startWithdrawDirect = useCallback(async () => {
    // if (pendingSafeTxs.length > 0) {
    //   await signAndExecute();
    //   return;
    // }

    // if we're here, means we've not yet a tx to sign
    // Any address can be used for destination. In this example, we use vitalik.eth
    const destinationAddress = '0xb250c202310da0b15b82E985a30179e74f414457'
    const amount = props.withdrawSafeData.amount.toString();
    const gasLimit = '500000'
    const safeTransactionData = {
      to: destinationAddress,
      data: '0x',// leave blank for native token transfers
      value: amount,
      operation: OperationType.Call
    }
    const options = {
      gasLimit
    }
    // const ethAdapter = await getEthAdapter();
    const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm");
    const privateKey = await genPersonalPrivateKeys(signer as Signer);
    const userStealthPrivateKey = UmbraSafe.computeStealthPrivateKey(privateKey.spendingKeyPair.privateKeyHex as string, props.withdrawSafeData.randomNumber);
    const wallet = new ethers.Wallet(userStealthPrivateKey, provider);
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: wallet
    });
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
    const safeSingletonContract = await getSafeContract({ ethAdapter, safeVersion: await safeSDK.getContractVersion() })

    const encodedTx = safeSingletonContract.encode('execTransaction', [
      signedSafeTx.data.to,
      signedSafeTx.data.value,
      signedSafeTx.data.data,
      signedSafeTx.data.operation,
      signedSafeTx.data.safeTxGas,
      signedSafeTx.data.baseGas,
      signedSafeTx.data.gasPrice,
      signedSafeTx.data.gasToken,
      signedSafeTx.data.refundReceiver,
      signedSafeTx.encodedSignatures()
    ])

    const response = await relayKit.relayTransaction({
      target: props.withdrawSafeData.stealthSafeReceiver,
      encodedTransaction: encodedTx,
      chainId: 100,
      options: options
    })








    // const signedSafeTx = await safeSDK.signTransaction(safeTransaction)
    //
    // console.log("wallet.getAddress()", await wallet.getAddress());
    //
    // const transactionConfig = {
    //   safeAddress: props.withdrawSafeData.stealthSafeReceiver,
    //   safeTransactionData: safeTransaction.data,
    //   safeTxHash: await safeSDK.getTransactionHash(safeTransaction),
    //   senderAddress: await wallet.getAddress(),
    //   senderSignature: signedSafeTx.encodedSignatures(),
    //   origin: "withdraw"
    // } as unknown as ProposeTransactionProps
    //
    // const propose = await safeService.proposeTransaction(transactionConfig)

  }, [props, pendingSafeTxs, signer, account]);

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
            <Button variant={"contained"} onClick={startWithdrawDirect} disabled={!hasCheckPendingTxsRun}>
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
