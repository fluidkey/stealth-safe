import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { gnosis } from 'wagmi/chains'
import process from 'process'
import React from "react";
import {ThemeProvider} from "@mui/system";
import {theme} from "@/GlobalStyles";
import {Container, CssBaseline} from "@mui/material";
import {ReceiveProvider} from "@/context/ReceiveContext";
import {SendProvider} from "@/context/SendContext";
import Head from 'next/head'

const chains = [gnosis]
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="lg">
            <ReceiveProvider>
              <SendProvider>
                <Head>
                  <title>Stealth Safe - A POC by Sefu project</title>
                  <link rel="icon" href="/favicon.ico" />
                </Head>
                <Component {...pageProps} />
              </SendProvider>
            </ReceiveProvider>
          </Container>
        </ThemeProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
