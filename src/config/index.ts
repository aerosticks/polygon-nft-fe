import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x6652Fce06A0c0C7397f396B6C0D259B2e7fcc8b1'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
