<script lang="ts">
	import { page } from '$app/stores';
	import {
		getCharacterNFT,
		getTokenURI,
		getAllTokenURI,
		getXP,
		getRequiredXP
	} from 'src/hooks/characters';
	import {
		mintCharEvents,
		attackEvents,
		burnedEvents,
		trainedEvents,
		xpGainedEvents,
		type MintedEvents
	} from 'src/hooks/events';
	import {
		chainId,
		defaultEvmStores,
		connected,
		provider,
		signer,
		signerAddress
	} from 'svelte-ethers-store';
	import { sdk } from 'src/stores/eth-sdk';
	import { EVENTS_CHAINBATTLES } from 'src/utils/single-provider';
	import { onMount } from 'svelte';
	import {
		eventTrainTrigger,
		eventAttackTrigger,
		eventBurnTrigger,
		eventXPTrigger,
		eventHealTrigger,
		eventReviveTrigger,
		eventKilledTrigger
	} from 'src/routes/nfts/store';

	function extractNumbersFromString(inputString: string) {
		const numberArray = [];
		const regex = /\d+/g; // Match one or more digits globally

		let match;
		while ((match = regex.exec(inputString)) !== null) {
			numberArray.push(parseInt(match[0], 10)); // Convert the matched string to an integer
		}

		return numberArray;
	}

	$: console.log('TOKEN ARRAY ', extractNumbersFromString($page?.url?.pathname));
	$: fightingTokenIds = extractNumbersFromString($page?.url?.pathname);

	$: userCharStats = getCharacterNFT(Number(fightingTokenIds[0]));
	$: enemyCharStats = getCharacterNFT(Number(fightingTokenIds[1]));
	$: userNftChar = getTokenURI(Number(fightingTokenIds[0]));
	$: enemyNftChar = getTokenURI(Number(fightingTokenIds[1]));

	function fightNft() {
		console.log('fight tokens', Number(fightingTokenIds[0]), Number(fightingTokenIds[1]));
		$sdk.CHAINBATTLES?.connect($signer)
			.attack(Number(fightingTokenIds[0]), Number(fightingTokenIds[1]))
			.then((res) => console.log('start fight', res))
			.catch((err) => console.warn('error fighting', err));
	}

	function healNft() {
		console.log('healing token ', Number(fightingTokenIds[0]));
		$sdk.CHAINBATTLES?.connect($signer)
			.heal(Number(fightingTokenIds[0]))
			.then((res) => {
				console.log('start healing ', res);
			})
			.catch((err) => {
				console.warn('error healing ', err);
			});
	}

	function reviveNft() {
		console.log('reviving token ', Number(fightingTokenIds[0]));
		$sdk.CHAINBATTLES.connect($signer)
			.revive(Number(fightingTokenIds[0]))
			.then((res) => {
				console.log('start reviving ', res);
			})
			.catch((err) => {
				console.warn('error reviving ', err);
			});
	}

	onMount(() => {
		if (!$sdk || !$sdk.CHAINBATTLES || !EVENTS_CHAINBATTLES) return;

		const handleFightEvent = (attackerTokenId: number, victimTokenId: number, damage: number) => {
			const fighting = { attackerTokenId, victimTokenId, damage };
			console.log('new fight event', fighting);
			eventAttackTrigger.update((value) => !value);
		};

		const handleXpEvent = (owner: string, xpPoints: number) => {
			const gainXP = { owner, xpPoints };
			console.log('new xp event', gainXP);
			eventXPTrigger.update((value) => !value);
		};

		const handleHealEvent = (tokenId: number, healAmount: number) => {
			const healing = { tokenId, healAmount };
			console.log('new heal event', healing);
			eventHealTrigger.update((value) => !value);
		};

		const handleReviveEvent = (tokenId: number) => {
			const reviving = { tokenId };
			console.log('new revive event', reviving);
			eventReviveTrigger.update((value) => !value);
		};

		const handleKilledEvent = (owner: string, tokenId: number) => {
			const killed = { owner, tokenId };
			console.log('new killed event', killed);
			eventKilledTrigger.update((value) => !value);
		};

		const fightFilter = EVENTS_CHAINBATTLES.filters.Attacked();
		const xpFilter = EVENTS_CHAINBATTLES.filters.XPgained();
		const healFilter = EVENTS_CHAINBATTLES.filters.Healed();
		const reviveFilter = EVENTS_CHAINBATTLES.filters.Revived();
		const killedFilter = EVENTS_CHAINBATTLES.filters.Killed();

		EVENTS_CHAINBATTLES.on(fightFilter, handleFightEvent);
		EVENTS_CHAINBATTLES.on(xpFilter, handleXpEvent);
		EVENTS_CHAINBATTLES.on(healFilter, handleHealEvent);
		EVENTS_CHAINBATTLES.on(reviveFilter, handleReviveEvent);
		EVENTS_CHAINBATTLES.on(killedFilter, handleKilledEvent);

		return () => {
			EVENTS_CHAINBATTLES.off(fightFilter, handleFightEvent);
			EVENTS_CHAINBATTLES.off(xpFilter, handleXpEvent);
			EVENTS_CHAINBATTLES.off(healFilter, handleHealEvent);
			EVENTS_CHAINBATTLES.off(reviveFilter, handleReviveEvent);
			EVENTS_CHAINBATTLES.on(killedFilter, handleKilledEvent);
		};
	});

	$: console.log('NFT URIs', $userNftChar, $enemyNftChar, $userCharStats?.life.toNumber());
</script>

<div>
	<!-- <p>fight screen with user nft VS other user nft. showing the nft image and battle data</p> -->

	<div class="flex items-center justify-between px-10">
		<div class="pt-40">
			<div>
				<p>Damage Dealt:</p>
				<p>XP Gained:</p>
				<p>Damage Taken:</p>
			</div>
			<img class="rounded-lg w-80" src={$userNftChar?.image || ''} alt="SVG" />
			<div>
				<p>Total XP:</p>
			</div>
			<div class="space-x-2 py-2 flex items-center justify-center">
				<button
					disabled={$userCharStats?.alive == false || $enemyCharStats?.alive == false}
					on:click={(_) => {
						console.log('ALIVE STATES', $userCharStats?.alive, $enemyCharStats?.alive);
						if ($userCharStats?.alive == true && $enemyCharStats?.alive == true) {
							fightNft();
						}
					}}
					class={'border  rounded-lg  px-2 py-1 ' +
						($userCharStats?.alive == false || $enemyCharStats?.alive == false
							? 'bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300'
							: 'border-black bg-slate-200 hover:bg-slate-300')}>Attack</button
				>
				<button
					disabled={$userCharStats?.life.toNumber() == 100 && $userCharStats?.alive == false}
					on:click={(_) => {
						if ($userCharStats?.life.toNumber() != 100 && $userCharStats?.alive == true) {
							healNft();
						}
					}}
					class={'border  rounded-lg px-2 py-1 ' +
						($userCharStats?.life.toNumber() == 100 && $userCharStats?.alive == false
							? 'bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300'
							: 'bg-slate-200 hover:bg-slate-300 border-black')}>Heal (65xp)</button
				>
				<button
					disabled={$userCharStats?.life.toNumber() == 0 &&
						$userCharStats?.level.toNumber() == 0 &&
						$userCharStats?.alive == true}
					on:click={(_) => {
						if (
							$userCharStats?.life.toNumber() == 0 &&
							$userCharStats?.level.toNumber() == 0 &&
							$userCharStats?.alive == true
						) {
							reviveNft();
						}
					}}
					class={'border rounded-lg px-2 py-1 ' +
						($userCharStats?.life.toNumber() == 0 &&
						$userCharStats?.level.toNumber() == 0 &&
						$userCharStats?.alive == true
							? 'bg-slate-200 hover:bg-slate-300 border-black'
							: ' bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300')}
					>Revive (100xp)</button
				>
			</div>
		</div>
		<div><p class="text-3xl">VS</p></div>
		<div>
			<img class="rounded-lg w-80" src={$enemyNftChar?.image || ''} alt="SVG" />
			<div>
				<p>Damage Dealt:</p>
				<p>XP Gained:</p>
				<p>Damage Taken:</p>
			</div>
		</div>
	</div>
</div>
