import { ethers } from 'ethers';
import { UMBRA_SAFE_ABI, UMBRA_SAFE_ADDRESS } from "../Const";

const provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosis.gateway.fm"); 
const contractAddress = UMBRA_SAFE_ADDRESS; 
const contract = new ethers.Contract(contractAddress, UMBRA_SAFE_ABI, provider);

export async function getEvents(eventName: string) {
    const filter = contract.filters[eventName](); 
    const blockNumber = await provider.getBlockNumber();
    const startBlock = blockNumber - 20000;
    const logs = await provider.getLogs({
        fromBlock: startBlock, 
        toBlock: 'latest',
        address: contract.address,
        topics: filter.topics,
    });

    const parsedLogs = [];

    for (let log of logs) {
        const parsedLog = contract.interface.parseLog(log);
        const tx = await provider.getTransaction(log.transactionHash);
        parsedLog.sender = tx.from; 
        const block = await provider.getBlock(log.blockNumber);
        parsedLog.timestamp = new Date(block.timestamp * 1000); 
        parsedLogs.push(parsedLog);
    }

    return parsedLogs;
}



