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
      fetchSafeInfo(receiveData.selectedSafe).then();
  }, [receiveData.selectedSafe])

  // manages the new select of a safe
  const handleChange = useCallback((e: SelectChangeEvent<string>) => {
    receiveData.setSelectedSafe(e.target.value as string); // need to cast value as string
  }, [receiveData.safes]);

  // retrieve the info of the safe and of the owners of it
  const fetchSafeInfo = useCallback(async (safeAddress: string) => {
    receiveData.setSelectedSafeOwners([]);
    receiveData.setAreAllSafeOwnersInitialized(undefined);
    receiveData.setOwnersStealthKeys([]);
    const safeInfo = await getSafeInfo(safeAddress)
    const owners = safeInfo.owners;
    receiveData.setSelectedSafeOwners(owners);
    let safeStealthKeysArray: any = []
    for (let i = 0; i < owners.length; i++) {
      const safeStealthKeys = await getStealthKeys(owners[i]) as any
      if (safeStealthKeys.error) {
        receiveData.setAreAllSafeOwnersInitialized(false);
        console.log("Make sure all owners have registered their stealth keys.");
        return;
      } else {
        receiveData.setAreAllSafeOwnersInitialized(true);
        safeStealthKeys["owner"] = owners[i]
        safeStealthKeys["address"] = await generateAddress(safeStealthKeys.viewingPublicKey)
        safeStealthKeysArray.push(safeStealthKeys)
      }
    }
    receiveData.setOwnersStealthKeys(safeStealthKeysArray);
  }, [getSafeInfo, receiveData, getStealthKeys, generateAddress]);

  console.log(receiveData);

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
