import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';

const asyncMintCharEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Minted', 39851776, 'latest');

	const filteredInfo = await decodeMintedEvents(events);
	return filteredInfo;
};

export type MintedEvents = {
	owner: string;
	tokenId: string;
};

export const mintCharEvents: Readable<MintedEvents[]> = derived([sdk], ([$sdk], set) => {
	if (!$sdk) return;
	asyncMintCharEvents($sdk)
		.then((res) => {
			set(res);
		})
		.catch((err) => console.warn(err));
});

async function decodeMintedEvents(mintEvents) {
	let mintChars = [];
	for (let i = 0; i < mintEvents.length; i++) {
		const mint = {
			owner: mintEvents[i].args.owner,
			tokenId: mintEvents[i].args.tokenId.toString()
		};
		mintChars.push(mint);
	}

	return mintChars;
}
