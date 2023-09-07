import { getPolygonMumbaiSdk, type PolygonMumbaiSdk } from 'eth-sdk/build';
import { provider } from 'src/utils';
import { chainId, signer } from 'svelte-ethers-store';
import { derived, type Readable } from 'svelte/store';

export const sdk: Readable<PolygonMumbaiSdk> = derived(
	[signer, chainId],
	([$signer, $chainId], set) => {
		switch ($chainId) {
			case 80001:
				set(getPolygonMumbaiSdk(provider($chainId)));
				break;
			default:
				set(getPolygonMumbaiSdk(provider(80001)));
				break;
		}
	},
	null as any
);
