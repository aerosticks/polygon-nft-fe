import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';

const asyncGetCharacterNFT = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	let nft = await sdk.CHAINBATTLES.getCharacterStats(tokenId);

	console.log('CHAR STATS\n', nft);
	return nft;
};

export const getCharacterNFT = (tokenId: number) =>
	derived([sdk], ([$sdk], set) => {
		if (!$sdk) return;
		asyncGetCharacterNFT($sdk, tokenId)
			.then((res) => {
				set(res);
			})
			.catch((err) => console.warn(err));
	});

const asyncGetTokenURI = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	let uri = await sdk.CHAINBATTLES.tokenURI(tokenId);
	return await decodeJSON(uri);
};

export type NFTURI = {
	name: string;
	description: string;
	image: string;
};

export const getTokenURI = (tokenId: number) =>
	derived([sdk], ([$sdk], set) => {
		if (!$sdk) return;
		asyncGetTokenURI($sdk, tokenId)
			.then((res) => {
				// console.log('JSON URI\n', JSON.parse(res));
				set(res);
			})
			.catch((err) => console.warn(err));
	});

const asyncAllGetTokenURI = async (sdk: PolygonMumbaiSdk, tokenIds: number[]) => {
	let uris = [];
	console.log('PASSED tokenIds ', tokenIds);
	for (let i = 0; i < tokenIds.length; i++) {
		let uri = await sdk.CHAINBATTLES.tokenURI(tokenIds[i]);
		uris.push(decodeJSON(uri));
	}
	// return await decodeJSON(uri);
	return uris;
};

export const getAllTokenURI = (tokenIds: number[]) =>
	derived([sdk], ([$sdk], set) => {
		if (!$sdk) return;
		asyncAllGetTokenURI($sdk, tokenIds)
			.then((res) => {
				// console.log('JSON URI\n', JSON.parse(res));
				set(res);
			})
			.catch((err) => console.warn(err));
	});

function decodeJSON(encodedURI: string) {
	const base64Data = encodedURI.split(',')[1];
	const decodeData = atob(base64Data);
	const jsonData = JSON.parse(decodeData);

	return jsonData;
}
