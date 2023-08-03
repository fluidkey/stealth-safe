import React, {useEffect, useState} from 'react';
import {Box, Button, Typography} from "@mui/material";
import {Web3Button} from "@web3modal/react";
import {useAccount} from "wagmi";
import {useRouter} from "next/router";
import {theme} from "@/GlobalStyles";
import {useIsMobile} from "@/hooks/ui/mediaQueryHooks";

/**
 *
 * @param {React.PropsWithChildren<IHome>} props
 * @return {JSX.Element}
 * @constructor
 */
const Index: React.FC<IHome> = (props) => {

  const account = useAccount();
  const router = useRouter();
  const isMobile = useIsMobile();

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
         flexDirection={"column"}
         mt={5}
    >
      <Box display={"flex"}
           flexDirection={isMobile ? "column" : "row"}
           alignItems={"center"}
           mb={1}
      >
        <Typography variant={"h1"}>
          Stealth
        </Typography>
        <img src={"/safe_logo.png"}
             style={{width: 40, height: 40, margin: 16}}/>
        <Typography variant={"h1"}>
          Safe
        </Typography>
      </Box>
      <Box mb={6}>
        <Typography variant={"body1"} textAlign={"center"}>
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

      <Typography variant={"h3"} mt={6}>
        🎥 See demo
      </Typography>
      <iframe
        src="https://www.loom.com/embed/13f09835a6c24caa999265a63af6ff39"
        allowFullScreen
        style={{ width: isMobile ? 300 : 560, height: isMobile ? 168 : 315, marginTop: theme.spacing(2) }}
      />

    </Box>
  );
};

export interface IHome {

}

export default Index;
