import React from 'react';
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


/**
 *
 * @param {React.PropsWithChildren<IReceiveListOfWithdrawals>} props
 * @return {JSX.Element}
 * @constructor
 */
const ReceiveListOfWithdrawals: React.FC<IReceiveListOfWithdrawals> = (props) => {


  const rows = [{
    date: 1690032903,
    amount: 100,
    sender: "0xc08Fe093893db3A81766BCD1464a1a288C80F043",
    stealthSafeReceiver: "0x890E76Ef50B16Da99564Dce0ef7Ee554a35e5e55",
    hasBeenWithdrawn: false
  }, {
    date: 1690014900,
    amount: 80,
    sender: "0xc08Fe093893db3A81766BCD1464a1a288C80F043",
    stealthSafeReceiver: "0x890E76Ef50B16Da99564Dce0ef7Ee554a35e5e55",
    hasBeenWithdrawn: true
  }]


  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date Received</TableCell>
              <TableCell align={"right"}>Amount</TableCell>
              <TableCell>Sender</TableCell>
              <TableCell>Stealth Receiver</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.date}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Typography variant={"body1"}>
                    {format(new Date(row.date * 1000), 'yyyy MMM dd')}
                  </Typography>
                  <Typography variant={"body2"} color={"textSecondary"}>
                    {format(new Date(row.date * 1000), 'hh:mm a')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{display: "flex", alignItems: "baseline", justifyContent: "end"}} gap={0.5}>
                    <Typography>{row.amount}</Typography>
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
                  <Link href={`https://gnosisscan.io/address/${row.sender}`} style={{color: theme.palette.text.primary}} target={"_blank"}>
                    {getKeyShortAddress(row.stealthSafeReceiver)}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <Button>Withdraw</Button>
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
