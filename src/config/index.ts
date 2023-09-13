import type { Network } from 'src/utils';

export const COLLATERAL_DECIMALS = 18;

export default (chainId?: Network, defaultChainId?: Network) => {
	const config = {
		80001: {
			CHAINBATTLES: '0x7F1e599Fd2D123b9F2CfAd856376cB2A507015A1'
		}
	};
	return config[chainId == 80001 ? 80001 : defaultChainId || 80001];
};
