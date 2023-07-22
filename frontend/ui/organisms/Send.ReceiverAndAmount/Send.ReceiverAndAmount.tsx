import React, {useState} from 'react';
import {Box, TextField} from "@mui/material";
import {useSendData} from "@/context/SendContext";

/**
 *
 * @param {React.PropsWithChildren<ISendReceiverAndAmount>} props
 * @return {JSX.Element}
 * @constructor
 */
const SendReceiverAndAmount: React.FC<ISendReceiverAndAmount> = (props) => {
  const sendData = useSendData();

  const [inputType, setInputType] = useState<"address" | "ens" | "invalid">("invalid");
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    sendData.setSendTo(value);

    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    const isEnsDomain = /^[a-z0-9]+\.eth$/.test(value) || /^[a-z0-9]+\.[a-z0-9]+\.eth$/.test(value);

    // TODO allow to add an ENS domain

    if (isEthAddress) {
      setInputType("address");
      setError("");
      sendData.setIsReceiverValidAddress(true);
    } else {
      setInputType("invalid");
      sendData.setIsReceiverValidAddress(false);
    }
  }

  const handleBlur = () => {
    if (inputType === "invalid" && sendData.sendTo !== "") {
      setError("Invalid Ethereum Address");
    }
    if (sendData.sendTo == "") setError("");
  }

  return (
    <Box>
      <TextField label="Enter recipient address"
                 variant="standard"
                 value={sendData.sendTo}
                 onChange={handleInputChange}
                 onBlur={handleBlur}
                 error={!!error}
                 helperText={error}
                 sx={{
                   mt: 3,
                   width: 300
                 }}
      />
    </Box>
  );
};

export interface ISendReceiverAndAmount {

}

export default SendReceiverAndAmount;
