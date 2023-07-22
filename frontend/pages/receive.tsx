import React, {useCallback, useEffect, useState} from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Box, CircularProgress, Paper, Typography} from "@mui/material";
import {Web3Button} from "@web3modal/react";
import {getSafesForOwner} from "@/components/safe/safeApiKit";
import {useAccount} from "wagmi";
import {ReceiveProvider, useReceiveData} from "@/context/ReceiveContext";
import ReceiveSelectSafe from "@/ui/organisms/Receive.SelectSafe/Receive.SelectSafe";

/**
 *
 * @param {React.PropsWithChildren<IReceive>} props
 * @return {JSX.Element}
 * @constructor
 */
const Receive: React.FC<IReceive> = (props) => {


  const { address, isConnected } = useAccount();
  const receiveData = useReceiveData();
  const [isLoadingSafes, setIsLoadingSafes] = useState<boolean>(false);

  // launch load of safes
  useEffect(() => {
    if (isConnected && address && receiveData.safes.length === 0) {
      setIsLoadingSafes(true);
      getSafes().then();
    }
  }, [isConnected, address]);

  // get the safes
  const getSafes = useCallback(async () => {
    if (!address) return;
    const safes = await getSafesForOwner(address as string);
    receiveData.setSafes(safes.safes);
    receiveData.setSelectedSafe(safes.safes[0]);
    setIsLoadingSafes(false);
  }, [address, receiveData]);

  return (
    <>
      <CommonHeader/>
      <Box width={"100%"}
           display={"flex"}
           alignItems="center"
           flexDirection="column"
      >
        {/* Connected wallet row */}
        <Box width={"100%"} mt={2} display={"flex"} justifyContent={"center"}>
          <Web3Button />
        </Box>

        {/* Into of the page */}
        <Typography variant="h2"
                    sx={{
                      mt: 3
                    }}
        >
          Receive
        </Typography>
        <Typography variant="body1"
                    sx={{
                      mt: 1
                    }}
        >
          Receive money on a Safe you manage using a Stealth Safe
        </Typography>

        <Box mt={2}>
          {
            isLoadingSafes ?
              <CircularProgress/>
              :
              <ReceiveSelectSafe/>
          }
        </Box>



        {/*<Box sx={{*/}
        {/*  border: "1px #afafaf solid",*/}
        {/*  backgroundColor: "#f9f9f9",*/}
        {/*  p: 2,*/}
        {/*  borderRadius: 4*/}
        {/*}}>*/}
        {/*  Ciao*/}
        {/*</Box>*/}


      </Box>
    </>
  );
};

export interface IReceive {

}

export default Receive;
