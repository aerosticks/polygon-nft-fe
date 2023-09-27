import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import { ethers } from 'ethers';

const asyncMintGas = async (sdk: PolygonMumbaiSdk, signerAddress: string) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.mint({ from: signerAddress });
	console.log('mint gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(gas.toNumber() * 1.2));
};

export const mintGasEstimate = derived([sdk, signerAddress], ([$sdk, $signerAddress], set) => {
	if (!$sdk) return;
	asyncMintGas($sdk, $signerAddress)
		.then((res) => set(res))
		.catch((err) => console.warn('mint gas error', err));
});
