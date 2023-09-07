import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x4F4a6719608Aa80E6e35Ea24d640735eb8039fB2'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
