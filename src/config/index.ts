import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x3E1aF451494163d1a698E8b8f9E30b4904087F00'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
