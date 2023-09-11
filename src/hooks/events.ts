import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';

const asyncMintCharEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Minted', 39851776, 'latest');

	const filteredInfo = await decodeMintedEvents(events);
	// console.log('filtered events\n', filteredInfo);
	return filteredInfo;
};

export type MintedEvents = {
	owner: string;
	tokenId: number;
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
	// console.log('decode events\n', mintEvents);
	let mintChars = [];
	for (let i = 0; i < mintEvents.length; i++) {
		const mint = {
			owner: mintEvents[i].args.owner,
			tokenId: mintEvents[i].args.tokenId.toNumber()
		};
		mintChars.push(mint);
	}

	return mintChars;
}

const asyncAttackEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Attacked', 39851776, 'latest');

	const filteredInfo = await decodeAttackedEvents(events);

	console.log('ATTACK EVENTS', events);
	return filteredInfo;
};

export type AttackedEvents = {
	attacker: number;
	victim: number;
	damage: number;
};

export const attackEvents: Readable<AttackedEvents[]> = derived([sdk], ([$sdk], set) => {
	if (!sdk) return;
	asyncAttackEvents($sdk)
		.then((res) => {
			console.log('attack events res', res);
			set(res);
		})
		.catch((err) => {
			console.error('error with attack events', err);
		});
});

async function decodeAttackedEvents(attackEvents) {
	// console.log('decode events\n', mintEvents);
	let attacks = [];
	for (let i = 0; i < attackEvents.length; i++) {
		const attack = {
			attacker: attackEvents[i].args.attackerTokenId.toNumber(),
			victim: attackEvents[i].args.victimTokenId.toNumber(),
			damage: attackEvents[i].args.damage.toNumber()
		};
		attacks.push(attack);
	}

	return attacks;
}

const asyncBurnedEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = sdk.CHAINBATTLES.queryFilter('Burned', 39851776, 'latest');

	const filteredInfo = await decodeBurnedEvents(events);
	return filteredInfo;
};

type BurnEvents = {
	burnId: number;
};

export const burnedEvents: Readable<BurnEvents[]> = derived([sdk], ([$sdk], set) => {
	if (!$sdk) return;
	asyncBurnedEvents($sdk)
		.then((res) => {
			console.log('burned results', res);
			set(res);
		})
		.catch((err) => {
			console.error('error burning', err);
		});
});

async function decodeBurnedEvents(burnEvents) {
	// console.log('decode events\n', mintEvents);
	let burns = [];
	for (let i = 0; i < burnEvents.length; i++) {
		const burn = {
			burnId: burnEvents[i].args.tokenId.toNumber()
		};
		burns.push(burn);
	}

	return burns;
}

const asyncTrainedEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Trained', 39851776, 'latest');

	const filteredInfo = await decodeTrainedEvents(events);

	return filteredInfo;
};

type TrainEvents = {
	trainId: number;
	newLevel: number;
};

export const trainedEvents: Readable<TrainEvents[]> = derived([sdk], ([$sdk], set) => {
	if ($sdk) return;
	asyncTrainedEvents($sdk)
		.then((res) => {
			console.log('trained events res', res);
			set(res);
		})
		.catch((err) => {
			console.error('error with train events', err);
		});
});

async function decodeTrainedEvents(trainEvents) {
	// console.log('decode events\n', mintEvents);
	let trains = [];
	for (let i = 0; i < trainEvents.length; i++) {
		const train = {
			trainId: trainEvents[i].args.tokenId.toNumber(),
			newLevel: trainEvents[i].arg.newLevel.toNumber()
		};
		trains.push(train);
	}

	return trains;
}
