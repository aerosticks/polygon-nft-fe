import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x2a83f6137C6C6D31612d2C88dC2b1D6C1d16a7bb'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
