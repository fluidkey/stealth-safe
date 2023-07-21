import React from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Box} from "@mui/material";

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
      <Box mt={5}>
        text here
      </Box>
    </>
  );
};

export interface ISend {

}

export default Send;
