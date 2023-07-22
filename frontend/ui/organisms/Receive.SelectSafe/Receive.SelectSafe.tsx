import React, {useCallback} from 'react';
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {useReceiveData} from "@/context/ReceiveContext";

/**
 *
 * @param {React.PropsWithChildren<IReceiveSelectSafe>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveSelectSafe: React.FC<IReceiveSelectSafe> = (props) => {

  const receiveData = useReceiveData();

  const handleChange = useCallback((e: SelectChangeEvent<string>) => {
    receiveData.setSelectedSafe(e.target.value as string); // need to cast value as string
  }, [receiveData.safes]);

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel>Select your Safe</InputLabel>
      <Select
        value={receiveData.selectedSafe}
        onChange={handleChange}
        label="Age"
      >
        {
          receiveData.safes.map(s => (
            <MenuItem value={s} key={s}>
              {s}
            </MenuItem>
          ) )
        }
      </Select>
    </FormControl>
  );
};

export interface IReceiveSelectSafe {

}

export default ReceiveSelectSafe;
