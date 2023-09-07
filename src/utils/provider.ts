import { ethers } from 'ethers';
import { providers } from '@0xsequence/multicall';
import type { MulticallProvider } from '@0xsequence/multicall/dist/declarations/src/providers';

// 80001
export const mainDefaultChainId = 80001;

export type Network = 80001;

const networks = {
	80001: 'polygon-mumbai.g.alchemy.com/v2/E6LlRiKCnF9_iEA2Sareb216y39HSJ30'
};

export const blockTimes = (chainId?: 80001) => {
	const bt = {
		80001: 13
	};
	return bt[chainId || 80001];
};

const protocol =
	typeof window != 'undefined' && window?.location?.protocol ? window?.location?.protocol : 'http:';

const providerMap = {
	80001: new providers.MulticallProvider(
		new ethers.providers.StaticJsonRpcProvider('https:' + '//' + networks[80001]),
		{ timeWindow: 200, batchSize: 200 }
	),
	fallBack: new providers.MulticallProvider(
		new ethers.providers.StaticJsonRpcProvider('https:' + '//' + networks[80001]),
		{ timeWindow: 200, batchSize: 200 }
	)
};

export const provider = (chainId?: Network, defaultChainId?: Network): MulticallProvider => {
	return providerMap[
		chainId == mainDefaultChainId
			? mainDefaultChainId
			: 'fallBack' || defaultChainId || chainId || 80001
	];
};
