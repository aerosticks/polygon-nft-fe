import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import { ethers, type BigNumberish } from 'ethers';

const asyncMintGas = async (sdk: PolygonMumbaiSdk, signerAddress: string) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.mint({ from: signerAddress });
	console.log('mint gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(Math.ceil(gas.toNumber() * 1.2)));
};

export const mintGasEstimate: Readable<BigNumberish> = derived(
	[sdk, signerAddress],
	([$sdk, $signerAddress], set) => {
		if (!$sdk || !$signerAddress) return;
		asyncMintGas($sdk, $signerAddress)
			.then((res) => set(res))
			.catch((err) => console.warn('mint gas error', err));
	}
);

const asyncAttackGas = async (
	sdk: PolygonMumbaiSdk,
	signerAddress: string,
	token1: number,
	token2: number
) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.attack(token1, token2, { from: signerAddress });
	console.log('attack gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(Math.ceil(gas.toNumber() * 1.2)));
};

export const attackGasEstimate = (token1: number, token2: number): Readable<BigNumberish> =>
	derived([sdk, signerAddress], ([$sdk, $signerAddress], set) => {
		if (!$sdk || !$signerAddress) return;
		console.log('attack token numbers ', token1, token2);
		asyncAttackGas($sdk, $signerAddress, token1, token2)
			.then((res) => set(res))
			.catch((err) => console.warn('attack gas error ', err));
	});

const asyncHealGas = async (sdk: PolygonMumbaiSdk, signerAddress: string, token: number) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.heal(token, { from: signerAddress });
	console.log('heal gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(Math.ceil(gas.toNumber() * 1.2)));
};

export const healGasEstimate = (token: number): Readable<BigNumberish> =>
	derived([sdk, signerAddress], ([$sdk, $signerAddress], set) => {
		if (!$sdk || !$signerAddress) return;
		asyncHealGas($sdk, $signerAddress, token)
			.then((res) => set(res))
			.catch((err) => console.warn('heal gas error ', err));
	});

const asyncReviveGas = async (sdk: PolygonMumbaiSdk, signerAddress: string, token: number) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.revive(token, { from: signerAddress });
	console.log('revive gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(Math.ceil(gas.toNumber() * 1.2)));
};

export const reviveGasEstimate = (token: number): Readable<BigNumberish> =>
	derived([sdk, signerAddress], ([$sdk, $signerAddress], set) => {
		if (!$sdk || !$signerAddress) return;
		asyncReviveGas($sdk, $signerAddress, token)
			.then((res) => set(res))
			.catch((err) => console.log('revive gas error ', err));
	});

const asyncTrainGas = async (sdk: PolygonMumbaiSdk, signerAddress: string, token: number) => {
	let gas = await sdk.CHAINBATTLES.estimateGas.train(token, { from: signerAddress });
	console.log('train gas estimate ', gas.toNumber() * 1.2);
	return ethers.BigNumber.from(String(Math.ceil(gas.toNumber() * 1.2)));
};

export const trainGasEstimate = (token: number): Readable<BigNumberish> =>
	derived([sdk, signerAddress], ([$sdk, $signerAddress], set) => {
		if (!$sdk || !$signerAddress) return;
		asyncTrainGas($sdk, $signerAddress, token)
			.then((res) => set(res))
			.catch((err) => console.warn('train gas error ', err));
	});
