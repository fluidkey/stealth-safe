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
  const [selectedSafe, setSelectedSafe] = useState("")
  const [safeInfo, setSafeInfo] = useState<any>()
  const [stealthData, setStealthData] = useState<any>()
  const [sharedSafeViewKey, setSharedSafeViewKey] = useState({})

  async function fetchSafeInfo () {
    const safeInfo = await getSafeInfo(selectedSafe)
    setSafeInfo(safeInfo)
    const { viewingPubKey, viewingPubKeyPrefix} = await getSafe(selectedSafe)
    const getStealthData = await prepareSendToSafe(safeInfo.owners, viewingPubKey, viewingPubKeyPrefix)
    setStealthData(getStealthData)
    console.log(getStealthData)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSafe(e.target.value)
    }

    async function createStealthSafe () {
      /*  const stealthOwners = stealthData.map((owner: any) => owner.stealthAddress)
        console.log(stealthOwners)
        const safeAddress = await createSafe(stealthOwners, safeInfo.threshold, signer as Signer)
        console.log(safeAddress) */
        const sendToStealth = await send("0x25F9db15e172B91cA37C7ffbAFEF48Ba63f0938B")
    }
//0x25F9db15e172B91cA37C7ffbAFEF48Ba63f0938B
    async function send(stealthSafe: string) {
        console.log(stealthSafe, signer, stealthData[0].pubKeyXCoordinate, stealthData[0].encryptedRandomNumber.ciphertext)
        const tx = await sendPayment(stealthSafe, signer as Signer, stealthData[0].pubKeyXCoordinate, stealthData[0].encryptedRandomNumber.ciphertext, 500000000000000000)
        console.log(tx)
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
        <input type="text" placeholder="Enter Safe Address" onChange={handleInputChange}/>
        <button onClick={fetchSafeInfo}>Submit</button>
        <button onClick={createStealthSafe}>Create Stealth Safe</button>
      </main>
    </>
  )
}
