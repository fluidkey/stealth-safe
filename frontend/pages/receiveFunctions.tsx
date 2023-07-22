import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { useEthersSigner } from '@/components/utils/clientToSigner'
import { getSafeInfo } from '@/components/safe/safeApiKit'
import { useState } from 'react'
import { prepareSendToSafe } from '@/components/umbra/umbraExtended'
import { createSafe } from '@/components/safe/safeDeploy'
import { Signer } from 'ethers'
import { getSafe } from '@/components/safeKeyRegistry/getSafe'
import { sendPayment } from '@/components/umbra/umbraExtended'

const inter = Inter({ subsets: ['latin'] })

export default function sendFunctions() {

  const { address } = useAccount()
  const signer = useEthersSigner()
  
  async function getPersonalPrivateKeys() {
    

  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Web3Button />

      </main>
    </>
  )
}
