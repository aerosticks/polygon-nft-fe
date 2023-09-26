import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x4fb5309a38a1a8f0a0f07c98a25682f0729D97E6'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
