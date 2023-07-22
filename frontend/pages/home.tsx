import React, {useEffect, useState} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {Web3Button} from "@web3modal/react";
import {useAccount} from "wagmi";
import {useRouter} from "next/router";

/**
 *
 * @param {React.PropsWithChildren<IHome>} props
 * @return {JSX.Element}
 * @constructor
 */
const Home: React.FC<IHome> = (props) => {

  const account = useAccount();
  const router = useRouter();

  const [isAccountConnected, setIsAccountConnected] = useState<boolean>(false);

  useEffect(() => {
    if (account.isConnected)
      setIsAccountConnected(true);
  }, [account])


  return (
    <Box display={"flex"}
         alignItems={"center"}
         justifyContent={"center"}
         minHeight={"70vh"}
         flexDirection={"column"}>
      <Box display={"flex"}
           flexDirection={"row"}
           alignItems={"center"}
           mb={1}
      >
        <Typography variant={"h1"}>
          Stealth
        </Typography>
        <img src={"/safe_logo.png"}
             style={{width: 40, height: 40, marginLeft: 16, marginRight: 16}}/>
        <Typography variant={"h1"}>
          Safe
        </Typography>
      </Box>
      <Box mb={6}>
        <Typography variant={"body1"}>
          Receive and send, blending Safe advantages and stealth privacy
        </Typography>
      </Box>

      {
        isAccountConnected ?
          <Button variant={"contained"} onClick={() => router.push("/receive") }>
            Enter dApp
          </Button>
          :
          <Web3Button />
      }

    </Box>
  );
};

export interface IHome {

}

export default Home;
