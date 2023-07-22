import React, {useState} from 'react';
import {Box, InputAdornment, TextField, Typography} from "@mui/material";
import {useSendData} from "@/context/SendContext";
import {useAccount, useBalance} from "wagmi";

/**
 *
 * @param {React.PropsWithChildren<ISendReceiverAndAmount>} props
 * @return {JSX.Element}
 * @constructor
 */
const SendReceiverAndAmount: React.FC<ISendReceiverAndAmount> = (props) => {
  const sendData = useSendData();
  const account = useAccount();

  const [inputType, setInputType] = useState<"address" | "ens" | "invalid">("invalid");
  const [error, setError] = useState<string>("");

  const { data, isError, isLoading, isSuccess } = useBalance({
    address: account.address
  })

  console.log(data);

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = Number(value);
    if (!isNaN(amount) && amount >= 0.01) {
      sendData.setSendAmount(amount);
    } else sendData.setSendAmount(0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mt: 3 }}>

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

        <TextField variant="standard"
                   value={sendData.sendAmount}
                   onChange={handleAmountChange}
                   type="number"
                   InputProps={{
                     endAdornment: <InputAdornment position="end">xDAI</InputAdornment>,
                   }}
                   inputProps={{ min: "0.01", step: "0.01" }}
                   sx={{
                     width: 90,
                     '& input::-webkit-inner-spin-button': {
                       '-webkit-appearance': 'none',
                     },
                     '& input::-webkit-outer-spin-button': {
                       '-webkit-appearance': 'none',
                     },
                     '& input': {
                       '-moz-appearance': 'textfield',
                       'text-align': 'right'
                     },
                   }}
        />
      </Box>
      {
        !!data?.formatted ?
          <Box width={"100%"} textAlign={"right"} mt={0.5}>
            <Typography fontSize={13}>
              <strong>Balance:</strong>&nbsp;{parseFloat(data?.formatted).toFixed(2)} xDAI
            </Typography>
          </Box>
          :
          <Box/>
      }
    </Box>
  );
};

export interface ISendReceiverAndAmount {

}

export default SendReceiverAndAmount;
