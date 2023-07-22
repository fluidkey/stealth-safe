import React, {useCallback, useEffect, useState} from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Alert, Box, Button, CircularProgress, IconButton, Typography} from "@mui/material";
import SendReceiverAndAmount from "@/ui/organisms/Send.ReceiverAndAmount/Send.ReceiverAndAmount";
import {SendTransactionStep, useSendData} from "@/context/SendContext";
import {createSafe} from "@/components/safe/safeDeploy";
import {ethers, Signer} from "ethers";
import {useEthersSigner} from "@/components/utils/clientToSigner";
import {sendPayment} from "@/components/umbra/umbraExtended";
import {Close} from "@mui/icons-material";
import {useRouter} from "next/router";

/**
 *
 * @param {React.PropsWithChildren<ISend>} props
 * @return {JSX.Element}
 * @constructor
 */
const Send: React.FC<ISend> = (props) => {

  const sendData = useSendData();
  const signer = useEthersSigner();
  const router = useRouter();

  const [fundsTransaction, setFundsTransaction] = useState<string>("");

  useEffect(() => {
    if (sendData.isReceiverValidInitializedSafe) {
      // TODO - send the transaction to deploy a new safe
      sendData.setIsStealthSafeGenerationInProgress(true);
    }
  }, [sendData.isReceiverValidInitializedSafe]);

  // generates the stealth safe
  const generateStealthSafe = useCallback(async () => {
    // get the info from Safe and from the chain
    const fetchInitialData = await sendData.fetchSafeInfo();
    if (!fetchInitialData?.safeInfo || !fetchInitialData.safeStealthDataList) return;
    const stealthOwners = fetchInitialData.safeStealthDataList.map((owner: any) => owner.stealthAddress);
    const safeAddress = await createSafe(stealthOwners, fetchInitialData?.safeInfo?.threshold, signer as Signer);
    sendData.setGeneratedSafeStealthAddress(safeAddress);
    sendData.setIsStealthSafeGenerationInProgress(false);
  }, [sendData, signer]);

  // send the funds to the generated stealth address
  const sendFunds = useCallback(async () => {
    sendData.setIsSendFundInProgress(true);
    const tx = await sendPayment(
      sendData.generatedSafeStealthAddress,
      signer as Signer,
      sendData.safeStealthDataList[0].pubKeyXCoordinate,
      sendData.safeStealthDataList[0].encryptedRandomNumber.ciphertext,
      ethers.utils.parseEther(sendData.sendAmount.toString())
    );
    setFundsTransaction(tx.transactionHash);
    sendData.setSendTransactionCurrentStep(SendTransactionStep.FundsSent);
    sendData.setIsSendFundInProgress(false);

    // TODO - useEffect that listen for data and, once completed, resets everything
  }, [sendData]);

  return (
    <>
      <CommonHeader/>
      <Box width={"100%"}
           display={"flex"}
           alignItems="center"
           flexDirection="column"
      >
        {/* TODO - place a cool image above send */}
        <Typography variant="h2"
                    sx={{
                      mt: 3
                    }}
        >
          Send
        </Typography>
        <Typography variant="body1"
                    sx={{
                      mt: 1
                    }}
        >
          Send money to a Safe address that has been activated within the StealthSafe Registry
        </Typography>

        <SendReceiverAndAmount/>

        <Box mt={3}>
          {
            sendData.isStealthSafeGenerationInProgress ? (
                <Box display={"flex"} flexDirection={"row"}>
                  <CircularProgress size={25}/>
                  <Typography variant="body2" ml={1}>
                    Generating Stealth Safe
                  </Typography>
                </Box>
              )
              :
              sendData.isReceiverValidInitializedSafe === false ? (
                <Alert severity="warning">Address is not a valid Safe or it has not been initialized by receiver</Alert>
              )
              :
              sendData.isSendFundInProgress ? (
                <Box display={"flex"} flexDirection={"row"}>
                  <CircularProgress size={25}/>
                  <Typography variant="body2" ml={1}>
                    Sending Funds
                  </Typography>
                </Box>
              )
              :
              sendData.sendTransactionCurrentStep === SendTransactionStep.StealthSafeGenerated ? (
                <Button variant={"contained"}
                        onClick={sendFunds}
                        disabled={sendData.isSendFundInProgress}
                >
                  {/* Step 2 - send funds */}
                  Send funds
                </Button>
              )
              :
              sendData.sendTransactionCurrentStep === SendTransactionStep.FundsSent ? (
                <Alert severity="info"
                       action={
                         <Button
                           color="inherit"
                           size="small"
                           onClick={() => {
                             window.open(`https://gnosisscan.io/tx/${fundsTransaction}`);
                           }}
                         >
                           See Transaction
                         </Button>
                       }
                >
                  Funds sent!
                </Alert>
              ) : (
              <Button variant={"contained"}
                      onClick={generateStealthSafe}
                      disabled={!sendData.isReceiverValidAddress || sendData.sendAmount <= 0}
              >
                {/* Step 1 - create safe */}
                Initiate transaction
              </Button>
            )
          }
        </Box>
      </Box>
    </>
  );
};

export interface ISend {

}

export default Send;
