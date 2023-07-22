import React, {useCallback, useEffect} from 'react';
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {useReceiveData} from "@/context/ReceiveContext";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getStealthKeys} from "@/components/umbra/getStealthKeys";
import {generateAddress} from "@/components/umbra/generateAddressFromKey";

/**
 *
 * @param {React.PropsWithChildren<IReceiveSelectSafe>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveSelectSafe: React.FC<IReceiveSelectSafe> = (props) => {

  const receiveData = useReceiveData();

  // every time a new safe is selected, fetch the infos
  useEffect(() => {
    if (receiveData.selectedSafe)
      receiveData.fetchSafeInfo().then();
  }, [receiveData.selectedSafe])

  // manages the new select of a safe
  const handleChange = useCallback((e: SelectChangeEvent<string>) => {
    receiveData.setSafeViewKey(undefined);
    receiveData.setIsSelectedSafeInitialized(undefined);
    receiveData.setOwnersStealthKeys([]);
    receiveData.setSelectedSafeOwners([]);
    receiveData.setAreAllSafeOwnersInitialized(undefined);
    receiveData.setSelectedSafe(e.target.value as string); // need to cast value as string
  }, [receiveData.safes]);

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel>Select your Safe</InputLabel>
      <Select
        value={receiveData.selectedSafe}
        onChange={handleChange}
        label="Select your Safe"
        sx={{width: 300}}
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
