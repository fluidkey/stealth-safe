import React, {useState} from 'react';
import CommonHeader from "@/ui/organisms/Common.Header/Common.Header";
import {Box, Button, TextField, Typography} from "@mui/material";

/**
 *
 * @param {React.PropsWithChildren<ISend>} props
 * @return {JSX.Element}
 * @constructor
 */
const Send: React.FC<ISend> = (props) => {

  const [recipientAddressInput, setRecipientAddressInput] = useState<string>("");
  const [inputType, setInputType] = useState<"address" | "ens" | "invalid">("invalid");
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientAddressInput(value);

    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(value);
    const isEnsDomain = /^[a-z0-9]+\.eth$/.test(value) || /^[a-z0-9]+\.[a-z0-9]+\.eth$/.test(value);

    if (isEthAddress) {
      setInputType("address");
      setError("");
    } else if (isEnsDomain) {
      setInputType("ens");
      setError("");
    } else {
      setInputType("invalid");
    }
  }

  const handleBlur = () => {
    if (inputType === "invalid") {
      setError("Invalid Ethereum Address or ENS domain");
    }
  }

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
        <TextField label="Enter recipient address"
                   variant="standard"
                   value={recipientAddressInput}
                   onChange={handleInputChange}
                   onBlur={handleBlur}
                   error={!!error}
                   helperText={error}
                   sx={{
                     mt: 3
                   }}
        />

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
