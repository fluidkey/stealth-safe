import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Web3Button } from '@web3modal/react'
import {useAccount} from 'wagmi'
import getSafeAddress from '@/components/safeApiKit'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const { address } = useAccount()

  async function getSafes () {
    if (!address) return
    const safes = await getSafeAddress(address as string)
    console.log(safes)
  }

  return (
    <>
      <Head>
        <title></title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <Web3Button />
        <button onClick={getSafes}>Get Safes</button>
      </main>
    </>
  )
}
