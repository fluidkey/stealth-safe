import React from 'react';
import {Box, Typography} from "@mui/material";
import Link from "next/link";
import {theme} from "@/GlobalStyles";
import {Web3Button} from "@web3modal/react";
import {useIsMobile} from "@/hooks/ui/mediaQueryHooks";
import {useRouter} from "next/router";

/**
 *
 * @param {React.PropsWithChildren<ICommonHeader>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonHeader: React.FC<ICommonHeader> = (props) => {

  const isMobile = useIsMobile();
  const router = useRouter();


  return (
    <Box width={"100%"}
         display={"flex"}
         flexDirection={"column"}
    >
      <Box width={"100%"}
           minHeight={80}
           display={"flex"}
           alignItems={"center"}
           justifyContent={"center"}
           position={"relative"}
      >
        <Link href={"/home"} style={{textDecoration: "none", color: theme.palette.text.primary}}>
          <Box display={"flex"}
               flexDirection={"row"}
               alignItems={"center"}
               sx={{
                 cursor: "pointer"
               }}
          >
            <Typography variant={"h3"}>
              Stealth
            </Typography>
            <img src={"/safe_logo.png"}
                 style={{width: 30, height: 30, marginLeft: 8, marginRight: 8}}/>
            <Typography variant={"h3"}>
              Safe
            </Typography>
          </Box>
        </Link>

        {
          !isMobile ?
            <Box position={"absolute"} right={0}>
              <Web3Button />
            </Box>
            :
            ""
        }
      </Box>
      <Box display={"flex"} flexDirection={"row"} justifyContent={"center"}>
        <Typography
          variant={"h4"}
          mr={1}
          onClick={() => router.push("/send")}
          sx={{
            cursor: "pointer",
            textDecoration: router.pathname === '/send' ? 'underline' : 'none'
          }}>
          Send
        </Typography>
        <Typography
          variant={"h4"}
          ml={1}
          onClick={() => router.push("/receive")}
          sx={{
            cursor: "pointer",
            textDecoration: router.pathname === '/receive' ? 'underline' : 'none'
          }}>
          Receive
        </Typography>
      </Box>
    </Box>
  );
};

export interface ICommonHeader {

}

export default CommonHeader;
