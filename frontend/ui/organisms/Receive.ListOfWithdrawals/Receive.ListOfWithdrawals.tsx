import React, {useCallback, useEffect} from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {getKeyShortAddress} from "@/utils/web3/address";
import Link from "next/link";
import { format } from 'date-fns';
import {theme} from "@/GlobalStyles";
import WithdrawButton from "@/ui/organisms/Receive.ListOfWithdrawals/WithdrawButton";
import {useReceiveData, WithdrawSafe} from "@/context/ReceiveContext";
import {BigNumber, ethers, Signer} from "ethers";
import {genPersonalPrivateKeys} from "@/components/umbra/umbraExtended";
import {decryptPrivateViewKey} from "@/components/eth-crypto/decryptPrivateViewKey";
import {getEvents} from "@/components/utils/getEvents";
import {KeyPair} from "umbra/umbra-js/src";
import {getSafeInfo} from "@/components/safe/safeApiKit";
import {getSafe} from "@/components/safeKeyRegistry/getSafe";
import {useAccount} from "wagmi";
import {useEthersSigner} from "@/components/utils/clientToSigner";


/**
 *
 * @param {React.PropsWithChildren<IReceiveListOfWithdrawals>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveListOfWithdrawals: React.FC<IReceiveListOfWithdrawals> = (props) => {


  const receiveData = useReceiveData();
  const account = useAccount();
  const signer = useEthersSigner();

  useEffect(() => {
    if (signer)
      orchestrateRetrieveOfData().then();
  }, [signer]);

  const orchestrateRetrieveOfData = useCallback(async () => {
    const safeInfo = await getSafe(receiveData.selectedSafe);
    const encSafeViewPrivateKeysList = safeInfo['safeViewPrivateKeyList'];
    const myEncSafeViewPrivateKey = encSafeViewPrivateKeysList.find(e => e['owner'] === account.address);
    console.log("myEncSafeViewPrivateKey", myEncSafeViewPrivateKey);
    const personalPrivateKey = await genPersonalPrivateKeys(signer as Signer);
    const safeViewKeyPrivate = await decryptPrivateViewKey(personalPrivateKey.viewingKeyPair.privateKeyHex as string, myEncSafeViewPrivateKey['encKey']);

    console.log("safeViewKeyPrivate", safeViewKeyPrivate);
    const data = await scan(safeViewKeyPrivate, personalPrivateKey.spendingKeyPair.privateKeyHex as string);
    receiveData.overwriteWithdrawSafeList(data);
  }, [receiveData, getSafe, account, signer]);

  async function scan(safePrivateViewKey: string, personalSpendingPrivateKeyHex: string): Promise<WithdrawSafe[]> {
    const results = await getEvents("Announcement")//await scanPayments(personalPrivateKeys.spendingKeyPair.privateKeyHex, safePrivateViewKey)
    let dataArray = []
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      console.log("result.args", result.args)
      const uncompressedPubKey = KeyPair.getUncompressedFromX(result.args.pkx)
      console.log(uncompressedPubKey)
      const payload = { ephemeralPublicKey: uncompressedPubKey, ciphertext: result.args.ciphertext }
      console.log(safePrivateViewKey)
      const viewingKeyPair = new KeyPair(safePrivateViewKey)
      const randomNumber = viewingKeyPair.decrypt(payload)
      console.log(randomNumber)
      const spendingKeyPair = new KeyPair(personalSpendingPrivateKeyHex)
      console.log(spendingKeyPair)
      const computedReceivingAddress = spendingKeyPair.mulPrivateKey(randomNumber)
      console.log(computedReceivingAddress)
      const safeInfo = await getSafeInfo(result.args.receiver)
      console.log(safeInfo)
      if (safeInfo.owners.includes(computedReceivingAddress.address)) {
        dataArray.push({ result, computedReceivingAddress, randomNumber })
      }
    }
    console.log(dataArray)
    return dataArray.map(d => ({
      // @ts-ignore
      date: d.result.timestamp,
      amount: d.result.args[1],
      // @ts-ignore
      sender: d.result.sender,
      randomNumber: d.randomNumber,
      stealthSafeReceiver: d.result.args[0],
      hasBeenWithdrawn: false,
      hasBeenExecuted: false,
      hasBeenInitiated: false
    }))
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date Received</TableCell>
              <TableCell align={"right"}>Amount</TableCell>
              <TableCell align="right">Sender</TableCell>
              <TableCell align="right">Stealth Receiver</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receiveData.withdrawSafeList.map((row) => (
              <TableRow
                key={row.date}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Typography variant={"body1"}>
                    {format(new Date(row.date), 'yyyy MMM dd')}
                  </Typography>
                  <Typography variant={"body2"} color={"textSecondary"}>
                    {format(new Date(row.date), 'hh:mm a')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{display: "flex", alignItems: "baseline", justifyContent: "end"}} gap={0.5}>
                    <Typography>{ethers.utils.formatEther(row.amount)}</Typography>
                    {/*<img src={"/xdai_logo.webp"} width={15} height={15}/>*/}
                    <Typography fontSize={13}>xDAI</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Link href={`https://gnosisscan.io/address/${row.sender}`} style={{color: theme.palette.text.primary}} target={"_blank"}>
                    {getKeyShortAddress(row.sender)}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <Link href={`https://gnosisscan.io/address/${row.stealthSafeReceiver}`} style={{color: theme.palette.text.primary}} target={"_blank"}>
                    {getKeyShortAddress(row.stealthSafeReceiver)}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <WithdrawButton withdrawSafeData={row}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export interface IReceiveListOfWithdrawals {

}

export default ReceiveListOfWithdrawals;
