import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x057C2D44c3106C4098253ad9539818F4e7CD98D7'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
