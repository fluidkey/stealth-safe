import React from 'react';
import {Box, Typography} from "@mui/material";
import Link from "next/link";
import {theme} from "@/GlobalStyles";

/**
 *
 * @param {React.PropsWithChildren<ICommonHeader>} props
 * @return {JSX.Element}
 * @constructor
 */
const CommonHeader: React.FC<ICommonHeader> = (props) => {
  return (
    <Box width={"100%"}
         minHeight={80}
         display={"flex"}
         alignItems={"center"}
         justifyContent={"center"}
    >
      <Link href={"/home"} style={{textDecoration: "none", color: theme.palette.text.primary}}>
        <Box display={"flex"}
             flexDirection={"row"}
             alignItems={"center"}
             sx={{
               cursor: "pointer"
             }}
        >
          <Typography variant={"h4"}>
            Stealth
          </Typography>
          <img src={"/safe_logo.png"}
               style={{width: 20, height: 20, marginLeft: 8, marginRight: 8}}/>
          <Typography variant={"h4"}>
            Safe
          </Typography>
        </Box>
      </Link>
    </Box>
  );
};

export interface ICommonHeader {

}

export default CommonHeader;
