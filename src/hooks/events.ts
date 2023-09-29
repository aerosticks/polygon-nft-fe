import { sdk } from 'src/stores/eth-sdk';
import { derived, get, type Readable } from 'svelte/store';
import { connected, signer, signerAddress } from 'svelte-ethers-store';
import type { PolygonMumbaiSdk } from 'eth-sdk/build';
import {
	eventMintTrigger,
	eventTrainTrigger,
	eventAttackTrigger,
	eventBurnTrigger,
	eventXPTrigger,
	eventHealTrigger,
	eventReviveTrigger,
	eventKilledTrigger,
	attackAnimation,
	healAnimation,
	reviveAnimation,
	xpAnimation
} from 'src/routes/nfts/store';

const asyncMintCharEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Minted', 40605517, 'latest');

	console.log('mint events ', events);

	const filteredInfo = await decodeMintedEvents(events);
	// console.log('filtered events\n', filteredInfo);
	return filteredInfo;
};

export type MintedEvents = {
	owner: string;
	tokenId: number;
};

export const mintCharEvents: Readable<MintedEvents[]> = derived(
	[sdk, eventMintTrigger, eventTrainTrigger, eventAttackTrigger, eventBurnTrigger, eventXPTrigger],
	(
		[
			$sdk,
			$eventMintTrigger,
			$eventTrainTrigger,
			$eventAttackTrigger,
			$eventBurnTrigger,
			$eventXPTrigger
		],
		set
	) => {
		if (!$sdk) return;
		console.log('fetch mint events');
		asyncMintCharEvents($sdk)
			.then((res) => {
				set(res);
			})
			.catch((err) => console.warn(err));
	}
);

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
	let events = await sdk.CHAINBATTLES.queryFilter('Attacked', 40605517, 'latest');

	const filteredInfo = await decodeAttackedEvents(events);

	console.log('ATTACK EVENTS', events);
	return filteredInfo;
};

export type AttackedEvents = {
	attacker: number;
	victim: number;
	attackDamage: number;
	defenderDamage: number;
};

export const attackEvents: Readable<AttackedEvents[]> = derived(
	[sdk, eventAttackTrigger],
	([$sdk, $eventAttackTrigger], set) => {
		if (!sdk) return;
		console.log('fetch fight events');
		asyncAttackEvents($sdk)
			.then((res) => {
				// console.log('attack events res', res);
				set(res);
				xpAnimation.update((value) => (value = true));
			})
			.catch((err) => {
				console.error('error with attack events', err);
			});
	}
);

async function decodeAttackedEvents(attackEvents) {
	// console.log('decode events\n', mintEvents);
	let attacks = [];
	for (let i = 0; i < attackEvents.length; i++) {
		const attack = {
			attacker: attackEvents[i].args.attackerTokenId.toNumber(),
			victim: attackEvents[i].args.victimTokenId.toNumber(),
			attackDamage: attackEvents[i].args.attackDamage.toNumber(),
			defenderDamage: attackEvents[i].args.defenseDamage.toNumber()
		};
		attacks.push(attack);
	}

	return attacks;
}

const asyncBurnedEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = sdk.CHAINBATTLES.queryFilter('Burned', 40605517, 'latest');

	const filteredInfo = await decodeBurnedEvents(events);
	console.log('burn events', events);
	return filteredInfo;
};

type BurnEvents = {
	burnId: number;
};

export const burnedEvents: Readable<BurnEvents[]> = derived(
	[sdk, eventBurnTrigger],
	([$sdk, $eventBurnTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch burn events');
		asyncBurnedEvents($sdk)
			.then((res) => {
				// console.log('burned results', res);
				set(res);
			})
			.catch((err) => {
				console.error('error burning', err);
			});
	}
);

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
	let events = await sdk.CHAINBATTLES.queryFilter('Trained', 40605517, 'latest');

	const filteredInfo = await decodeTrainedEvents(events);

	console.log('train events', events);

	return filteredInfo;
};

type TrainEvents = {
	trainId: number;
	newLevel: number;
};

export const trainedEvents: Readable<TrainEvents[]> = derived(
	[sdk, eventTrainTrigger],
	([$sdk, $eventTrainTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch train events');
		asyncTrainedEvents($sdk)
			.then((res) => {
				// console.log('trained events res', res);
				set(res);
			})
			.catch((err) => {
				console.error('error with train events', err);
			});
	}
);

async function decodeTrainedEvents(trainEvents) {
	// console.log('decode events\n', mintEvents);
	let trains = [];
	for (let i = 0; i < trainEvents.length; i++) {
		const train = {
			trainId: trainEvents[i].args.tokenId.toNumber(),
			newLevel: trainEvents[i].args.newLevel.toNumber()
		};
		trains.push(train);
	}

	return trains;
}

const asyncXPEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('XPgained', 40605517, 'latest');

	const filteredInfo = await decodeXPEvents(events);

	console.log('xp gain events', events);

	return events;
};

export const xpGainedEvents = derived(
	[sdk, eventXPTrigger, eventHealTrigger, eventReviveTrigger, eventTrainTrigger],
	([$sdk, $eventXPTrigger, $eventHealTrigger, $eventReviveTrigger, $eventTrainTrigger], set) => {
		if (!$sdk) return;
		asyncXPEvents($sdk)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	}
);

async function decodeXPEvents(trainEvents) {
	// console.log('decode events\n', mintEvents);
	let trains = [];
	for (let i = 0; i < trainEvents.length; i++) {
		const train = {
			owner: trainEvents[i].args.owner.toString(),
			xpPoints: trainEvents[i].args.xpPoints.toNumber()
		};
		trains.push(train);
	}

	return trains;
}

const asyncHealEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Healed', 40605517, 'latest');

	const filteredInfo = await decodeHealEvents(events);

	console.log('heal events before decoding ', events);

	return filteredInfo;
};

export type HealEvents = {
	tokenId: number;
	healAmount: number;
};

export const healEvents: Readable<HealEvents[]> = derived(
	[sdk, eventHealTrigger],
	([$sdk, $eventHealTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch heal events');
		asyncHealEvents($sdk)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	}
);

async function decodeHealEvents(healEvents) {
	let heals = [];
	for (let i = 0; i < healEvents.length; i++) {
		const heal = {
			tokenId: healEvents[i].args.tokenId.toNumber(),
			healAmount: healEvents[i].args.healAmount.toNumber()
		};
		heals.push(heal);
	}

	return heals;
}

export type ReviveEvents = {
	tokenId: number;
};

const asyncReviveEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Revived', 40605517, 'latest');

	const filteredInfo = await decodeReviveEvents(events);

	console.log('revive events', events);

	return filteredInfo;
};

export const revivedEvents: Readable<ReviveEvents[]> = derived(
	[sdk, eventReviveTrigger],
	([$sdk, $eventReviveTrigger], set) => {
		if (!$sdk) return;
		console.log('fetch revive event');
		asyncReviveEvents($sdk)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	}
);

async function decodeReviveEvents(reviveEvents) {
	// console.log('decode events\n', mintEvents);
	let revives = [];
	for (let i = 0; i < reviveEvents.length; i++) {
		const revive = {
			tokenId: reviveEvents[i].args.tokenId.toNumber()
		};
		revives.push(revive);
	}

	return revives;
}

const asyncKilledEvents = async (sdk: PolygonMumbaiSdk) => {
	let events = await sdk.CHAINBATTLES.queryFilter('Killed', 40605517, 'latest');

	const filteredInfo = await decodeKilledEvents(events);

	console.log('killed events', events);

	return filteredInfo;
};

export const killedEvents = derived(
	[sdk, eventKilledTrigger],
	([$sdk, $eventKilledTrigger], set) => {
		if (!$sdk) return;
		asyncKilledEvents($sdk)
			.then((res) => {
				set(res);
			})
			.catch((err) => {
				console.warn(err);
			});
	}
);

async function decodeKilledEvents(killEvents) {
	// console.log('decode events\n', mintEvents);
	let kills = [];
	for (let i = 0; i < killEvents.length; i++) {
		const kill = {
			owner: killEvents[i].args.owner.toString(),
			tokenId: killEvents[i].args.tokenId.toNumber()
		};
		kills.push(kill);
	}

	return kills;
}
