import React from 'react';
import {Alert, Box, Button, Collapse, IconButton} from "@mui/material";
import {CloseIcon} from "@coinbase/wallet-sdk/dist/components/icons/CloseIcon";
import {Close} from "@mui/icons-material";

/**
 *
 * @param {React.PropsWithChildren<ISuccessInitialized>} props
 * @return {JSX.Element}
 * @constructor
 */
const SuccessInitialized: React.FC<ISuccessInitialized> = (props) => {

  const [open, setOpen] = React.useState(true);

  return (
    <Box sx={{ width: 300 }}>
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Safe correctly initialized
        </Alert>
      </Collapse>
    </Box>
  );
};

export interface ISuccessInitialized {

}

export default SuccessInitialized;
