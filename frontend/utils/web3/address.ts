/**
 * Ths file contains functions user to manipulate addresses and their format, expecially
 * when not directly available on ethers
 */

/**
 * Returns the first {numLetters} characters of a wallet address. The result exclude the starting 0x
 * @param address
 * @param numLetters
 * @param with0x
 */
export const getFirstLetters = (address: string | undefined, numLetters: number) => {
  if (!address) return "";
  return address.replace("0x", "").substring(0, numLetters).toUpperCase()
}


/**
 * Given an address, returns the 0xAAAA...AAAA version
 * @param address
 * @param numLetters
 * @param with0x
 */
export const getKeyShortAddress = (address: string | undefined) => {
  if (!address) return "";
  return address.substring(0, 6).toUpperCase() + "..." + address.substring(address.length-4, address.length).toUpperCase()
}

