import React, {useState} from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Box, Button, TextField, Typography} from "@mui/material";
import SendReceiverAndAmount from "@/ui/organisms/Send.ReceiverAndAmount/Send.ReceiverAndAmount";

/**
 *
 * @param {React.PropsWithChildren<ISend>} props
 * @return {JSX.Element}
 * @constructor
 */
const Send: React.FC<ISend> = (props) => {

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
          <Button variant={"contained"}>
            {/* Step 1 - create safe - Step 2 - send funds */}
            Initiate transaction
          </Button>
        </Box>
      </Box>
    </>
  );
};

export interface ISend {

}

export default Send;
