import React, {useCallback, useEffect, useState} from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Box, Button, CircularProgress, TextField, Typography} from "@mui/material";
import SendReceiverAndAmount from "@/ui/organisms/Send.ReceiverAndAmount/Send.ReceiverAndAmount";
import {useSendData} from "@/context/SendContext";

/**
 *
 * @param {React.PropsWithChildren<ISend>} props
 * @return {JSX.Element}
 * @constructor
 */
const Send: React.FC<ISend> = (props) => {

  const sendData = useSendData();

  useEffect(() => {
    if (sendData.isReceiverValidInitializedSafe) {
      // TODO - send the transaction to deploy a new safe
      sendData.setIsStealthSafeGenerationInProgress(true);
    }
  }, [sendData.isReceiverValidInitializedSafe]);

  const initiateTransaction = useCallback(() => {
    // check receipent is registered and valid
  }, []);

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
            sendData.isStealthSafeGenerationInProgress ?
              <Box display={"flex"} flexDirection={"row"}>
                <CircularProgress size={25}/>
                <Typography variant="body2" ml={1}>
                  Generating Stealth Safe
                </Typography>
              </Box>
              :
              <Button variant={"contained"} onClick={initiateTransaction} disabled={!sendData.isReceiverValidAddress}>
                {/* Step 1 - create safe - Step 2 - send funds */}
                Initiate transaction
              </Button>
          }
        </Box>
      </Box>
    </>
  );
};

export interface ISend {

}

export default Send;
