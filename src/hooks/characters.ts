import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';
import {
	eventAttackTrigger,
	eventTrainTrigger,
	eventXPTrigger,
	eventHealTrigger,
	eventReviveTrigger,
	eventKilledTrigger,
	eventMintTrigger
} from 'src/routes/nfts/store';

const asyncGetCharacterNFT = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	// console.log('SDK INFO', sdk);
	// console.log('char stats token id search ', tokenId, sdk.CHAINBATTLES);
	let nft = await sdk.CHAINBATTLES.getCharacterStats(tokenId);

	// console.log('CHAR STATS\n', nft);
	return nft;
};

export const getCharacterNFT = (tokenId: number) =>
	derived(
		[sdk, eventTrainTrigger, eventAttackTrigger, eventHealTrigger, eventReviveTrigger],
		([$sdk, $eventXPTrigger, $eventAttackTrigger, $eventHealTrigger, $eventReviveTrigger], set) => {
			if (!$sdk) return;
			asyncGetCharacterNFT($sdk, tokenId)
				.then((res) => {
					set(res);
				})
				.catch((err) => console.warn(err));
		}
	);

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
	derived(
		[sdk, eventAttackTrigger, eventHealTrigger, eventReviveTrigger],
		([$sdk, $eventAttackTrigger, $eventHealTrigger, $eventReviveTrigger], set) => {
			if (!$sdk) return;
			asyncGetTokenURI($sdk, tokenId)
				.then((res) => {
					// console.log('JSON URI\n', JSON.parse(res));
					set(res);
				})
				.catch((err) => console.warn(err));
		}
	);

const asyncAllGetTokenURI = async (sdk: PolygonMumbaiSdk, tokenIds: number[]) => {
	let uris = [];
	// console.log('PASSED tokenIds ', tokenIds);
	for (let i = 0; i < tokenIds.length; i++) {
		let uri = await sdk.CHAINBATTLES.tokenURI(tokenIds[i]);
		uris.push(decodeJSON(uri));
	}
	// return await decodeJSON(uri);
	return uris;
};

export const getAllTokenURI = (tokenIds: number[]) =>
	derived([sdk, eventMintTrigger], ([$sdk, $eventMintTrigger], set) => {
		if (!$sdk) return;
		console.log('get uris after events');
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

const asyncTrainNft = async (sdk: PolygonMumbaiSdk, tokenId: number, signer) => {
	let nftTrained = await sdk.CHAINBATTLES?.connect(signer).train(tokenId);

	return nftTrained;
};

export const trainNft = (tokenId: number) =>
	derived([sdk, signer], ([$sdk, $signer], set) => {
		if (!$sdk) return;
		asyncTrainNft($sdk, tokenId, $signer)
			.then((res) => {
				console.log('train results ', res);
				set(res);
			})
			.catch((err) => console.error(err));
	});

const asyncGetXP = async (sdk: PolygonMumbaiSdk, userAddress: string) => {
	let xpResult = await sdk.CHAINBATTLES.getXP(userAddress);

	console.log('XP amount ', xpResult);
	return xpResult.toNumber();
};

export const getXP = derived(
	[sdk, signerAddress, eventXPTrigger, eventAttackTrigger, eventTrainTrigger],
	([$sdk, $signerAddress, $eventXPTrigger, $eventAttackTrigger, $eventTrainTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch XP total');
		asyncGetXP($sdk, $signerAddress)
			.then((res) => {
				console.log('XP res ', res);
				set(res);
			})
			.catch((err) => {
				console.error(err);
			});
	}
);

const asyncGetRequiredXP = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	let requiredXP = await sdk.CHAINBATTLES.getAmountForNextLevel(Number(tokenId));

	console.log('REQ XP ', requiredXP);

	return requiredXP;
};

export const getRequiredXP = (tokenId: number) =>
	derived([sdk, eventTrainTrigger], ([$sdk, $eventTrainTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch new xp required');
		asyncGetRequiredXP($sdk, tokenId)
			.then((res) => {
				console.log('XP required res ', res);
				set(res);
			})
			.catch((err) => {
				console.error(err);
			});
	});

const asyncHealToken = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	let healToken = await sdk.CHAINBATTLES.heal(tokenId);

	console.log('healed token', healToken);

	return healToken;
};

export const healToken = (tokenId: number) =>
	derived([sdk], ([$sdk], set) => {
		if (!$sdk) return;
		asyncHealToken($sdk, tokenId)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	});

const asyncReviveToken = async (sdk: PolygonMumbaiSdk, tokenId: number) => {
	let reviveToken = await sdk.CHAINBATTLES.revive(tokenId);

	console.log('revived token', reviveToken);

	return reviveToken;
};

export const reviveToken = (tokenId: number) =>
	derived([sdk], ([$sdk], set) => {
		if (!$sdk) return;
		asyncReviveToken($sdk, tokenId)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	});
