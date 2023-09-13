import { ethers } from 'ethers';
import abi from 'eth-sdk/abis/polygonMumbai/CHAINBATTLES.json';

const rpc_url = 'https://polygon-mumbai.g.alchemy.com/v2/E6LlRiKCnF9_iEA2Sareb216y39HSJ30';
const sc_address = '0x7F1e599Fd2D123b9F2CfAd856376cB2A507015A1';

const rpcProvider = new ethers.providers.JsonRpcProvider(rpc_url);

export const EVENTS_CHAINBATTLES = new ethers.Contract(sc_address, abi, rpcProvider);
