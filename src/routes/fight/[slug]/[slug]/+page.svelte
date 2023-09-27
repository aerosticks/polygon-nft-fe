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
		killedEvents,
		healEvents,
		revivedEvents,
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
	import { onMount, afterUpdate } from 'svelte';
	import {
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
		xpAnimation,
		killAnimation
	} from 'src/routes/nfts/store';
	import { tweened } from 'svelte/motion';
	import { spring } from 'svelte/motion';
	import { cubicIn, cubicOut, cubicInOut } from 'svelte/easing';
	import { broadcastTransaction, resolvedTransactions } from 'src/stores/transactions';
	import { attackGasEstimate, healGasEstimate, reviveGasEstimate } from 'src/hooks/gas';
	import { type BigNumberish } from 'ethers';

	import SwordIcon from `~icons/game-icons/pointy-sword`;
	import DamageIcon from '~icons/mdi/sword-cross';
	import HealthIcon from `~icons/solar/health-bold`;
	import ReviveIcon from `~icons/game-icons/angel-outfit`;

	function extractNumbersFromString(inputString: string) {
		const numberArray = [];
		const regex = /\d+/g; // Match one or more digits globally

		let match;
		while ((match = regex.exec(inputString)) !== null) {
			numberArray.push(parseInt(match[0], 10)); // Convert the matched string to an integer
		}

		return numberArray;
	}

	const opacity = tweened(1, {
		duration: 500,
		easing: cubicOut
	});

	const positionX = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	const positionY = tweened(50, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	const positionXenemy = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	const positionYenemy = tweened(-100, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	const positionXdamage = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	const positionYdamage = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut
	});

	$: opacity.set($attackAnimation ? 1 : 0);

	function toggleOpacityEvery1Second() {
		setInterval(() => {
			opacity.set($opacity === 0 ? 1 : 0);
		}, 1500);
	}

	function toggleDamageAnimation() {
		setTimeout(() => {
			positionXdamage.set(0);
			positionYdamage.set(100);

			// xpAnimation.update(value => value = false)
			xpAnimation.update((value) => (value = false));
		}, 4000);
	}
	// afterUpdate(() => {
	// 	if($resolvedTransactions.length && $resolvedTransactions[0].status != 'Failed') {
	// 		console.log('showing damage')
	// 		if ($xpAnimation == true) {
	// 		toggleDamageAnimation();

	// 		}
	// 	}
	// });

	const scale = tweened(1, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut,
	});

	// Function to toggle the scale animation
	function toggleScale() {
		setTimeout(() => {
		scale.set(1.2); // Grow by 20%
		setTimeout(() => {
			scale.set(1); // Reset scale to 1 (original size)
			toggleScale(); // Repeat the animation
		}, 1000); // 1000 milliseconds = 1 second (duration of 1 cycle)
		}, 1000); // 2000 milliseconds = 2 seconds (repeat every 2 seconds)
	}

	const translateY = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut,
	});

	// Function to toggle the bounce animation
	function toggleBounce() {
		setTimeout(() => {
		translateY.set(-20); 
		setTimeout(() => {
			translateY.set(0, { duration: 1000 }); 
			toggleBounce(); // Repeat the animation
		}, 1000); 
		}, 1000); 
	}

	let isFadingOut = false;

	function toggleAnimation() {
		setTimeout(() => {
			if (!isFadingOut) {
				positionX.set(100);
				positionY.set(0);
			} else {
				positionX.set(0);
				positionY.set(50);
			}

			isFadingOut = !isFadingOut;
			toggleAnimation();
		}, 1500);
	}

	function toggleAnimationEnemy() {
		setTimeout(() => {
			if (!isFadingOut) {
				positionXenemy.set(0);
				positionYenemy.set(-100);
			} else {
				positionXenemy.set(-100);
				positionYenemy.set(-50);
			}

			// isFadingOut = !isFadingOut;
			toggleAnimationEnemy();
		}, 1500);
	}

	onMount(() => {
		toggleOpacityEvery1Second();
		toggleAnimation();
		toggleAnimationEnemy();
		toggleScale();
		toggleBounce();
		// toggleDamageAnimation();
	});

	$: latestAttackEvents = $attackEvents;
	$: latestHealEvents = $healEvents;

	$: console.log('attack EVENTS ', latestAttackEvents);

	$: console.log('TOKEN ARRAY ', extractNumbersFromString($page?.url?.pathname));
	$: fightingTokenIds = extractNumbersFromString($page?.url?.pathname);

	const attackGasEstimateStore = attackGasEstimate(
		extractNumbersFromString($page?.url?.pathname)[0],
		extractNumbersFromString($page?.url?.pathname)[1]
	);
	let attackGas: BigNumberish;
	attackGasEstimateStore.subscribe((value) => {
		attackGas = value;
	});

	const healGasEstimateStore = healGasEstimate(extractNumbersFromString($page?.url?.pathname)[0]);
	let healGas: BigNumberish;
	healGasEstimateStore.subscribe((value) => {
		healGas = value;
	});

	const reviveGasEstimateStore = reviveGasEstimate(
		extractNumbersFromString($page?.url?.pathname)[0]
	);
	let reviveGas: BigNumberish;
	reviveGasEstimateStore.subscribe((value) => {
		reviveGas = value;
	});

	$: userCharStats = getCharacterNFT(Number(fightingTokenIds[0]));
	$: enemyCharStats = getCharacterNFT(Number(fightingTokenIds[1]));
	$: userNftChar = getTokenURI(Number(fightingTokenIds[0]));
	$: enemyNftChar = getTokenURI(Number(fightingTokenIds[1]));

	$: console.log('user chart stats ', $userNftChar);

	function fightNft() {
		console.log('fight tokens', Number(fightingTokenIds[0]), Number(fightingTokenIds[1]));

		broadcastTransaction(
			'Fighting',
			$sdk.CHAINBATTLES?.connect($signer).attack(
				Number(fightingTokenIds[0]),
				Number(fightingTokenIds[1]),
				{ gasLimit: attackGas }
			)
		)
			.then((res) => {
				console.log('start fight', res);
				eventAttackTrigger.update((value) => !value);
				attackAnimation.update((value) => (value = true));
			})
			.catch((err) => console.warn('error fighting', err));
	}

	function healNft() {
		console.log('healing token ', Number(fightingTokenIds[0]));
		broadcastTransaction(
			'Healing',

			$sdk.CHAINBATTLES?.connect($signer).heal(Number(fightingTokenIds[0]), { gasLimit: healGas })
		)
			.then((res) => {
				console.log('start healing ', res);
				eventHealTrigger.update((value) => !value);
				healAnimation.update((value) => (value = true));
			})
			.catch((err) => {
				console.warn('error healing ', err);
			});
	}

	function reviveNft() {
		console.log('reviving token ', Number(fightingTokenIds[0]));
		broadcastTransaction(
			'Reviving',

			$sdk.CHAINBATTLES.connect($signer).revive(Number(fightingTokenIds[0]), {
				gasLimit: reviveGas
			})
		)
			.then((res) => {
				console.log('start reviving ', res);
				eventReviveTrigger.update((value) => !value);
				reviveAnimation.update((value) => (value = true));
			})
			.catch((err) => {
				console.warn('error reviving ', err);
			});
	}

	// onMount(() => {
	// 	if (!$sdk || !$sdk.CHAINBATTLES || !EVENTS_CHAINBATTLES) return;

	// 	const handleFightEvent = (attackerTokenId: number, victimTokenId: number, damage: number) => {
	// 		const fighting = { attackerTokenId, victimTokenId, damage };
	// 		console.log('new fight event', fighting);
	// 		eventAttackTrigger.update((value) => !value);
	// 		attackAnimation.update((value) => (value = false));
	// 	};

	// 	const handleXpEvent = (owner: string, xpPoints: number) => {
	// 		const gainXP = { owner, xpPoints };
	// 		console.log('new xp event', gainXP);
	// 		eventXPTrigger.update((value) => !value);
	// 		xpAnimation.update((value) => (value = false));
	// 	};

	// 	const handleHealEvent = (tokenId: number, healAmount: number) => {
	// 		const healing = { tokenId, healAmount };
	// 		console.log('new heal event', healing);
	// 		eventHealTrigger.update((value) => !value);
	// 		healAnimation.update((value) => (value = false));
	// 	};

	// 	const handleReviveEvent = (tokenId: number) => {
	// 		const reviving = { tokenId };
	// 		console.log('new revive event', reviving);
	// 		eventReviveTrigger.update((value) => !value);
	// 		reviveAnimation.update((value) => (value = false));
	// 	};

	// 	const handleKilledEvent = (owner: string, tokenId: number) => {
	// 		const killed = { owner, tokenId };
	// 		console.log('new killed event', killed);
	// 		eventKilledTrigger.update((value) => !value);
	// 	};

	// 	const fightFilter = EVENTS_CHAINBATTLES.filters.Attacked();
	// 	const xpFilter = EVENTS_CHAINBATTLES.filters.XPgained();
	// 	const healFilter = EVENTS_CHAINBATTLES.filters.Healed();
	// 	const reviveFilter = EVENTS_CHAINBATTLES.filters.Revived();
	// 	const killedFilter = EVENTS_CHAINBATTLES.filters.Killed();

	// 	EVENTS_CHAINBATTLES.addListener(fightFilter, handleFightEvent);
	// 	EVENTS_CHAINBATTLES.on(xpFilter, handleXpEvent);
	// 	EVENTS_CHAINBATTLES.on(healFilter, handleHealEvent);
	// 	EVENTS_CHAINBATTLES.on(reviveFilter, handleReviveEvent);
	// 	EVENTS_CHAINBATTLES.on(killedFilter, handleKilledEvent);

	// 	return () => {
	// 		EVENTS_CHAINBATTLES.off(fightFilter, handleFightEvent);
	// 		EVENTS_CHAINBATTLES.off(xpFilter, handleXpEvent);
	// 		EVENTS_CHAINBATTLES.off(healFilter, handleHealEvent);
	// 		EVENTS_CHAINBATTLES.off(reviveFilter, handleReviveEvent);
	// 		EVENTS_CHAINBATTLES.on(killedFilter, handleKilledEvent);
	// 	};
	// });

	$: console.log('NFT URIs', $userNftChar, $enemyNftChar, $userCharStats?.life.toNumber());
</script>

<div>
	<!-- <p>fight screen with user nft VS other user nft. showing the nft image and battle data</p> -->

	<div class="flex items-center justify-between px-10">
		<div class="pt-40">
			<!-- <div>
				<p>Damage Dealt:</p>
				<p>XP Gained:</p>
				<p>Damage Taken:</p>
			</div> -->
			<div class="relative">
				{#if $attackEvents?.length && $resolvedTransactions.length && $resolvedTransactions[0].status != 'Failed'}
					<div
						style="transform: translate({$positionXdamage}px, {$positionYdamage}px)"
						class={'absolute animation w-full flex items-center justify-center space-x-4 ' +
							($xpAnimation ? '' : 'inactive hidden')}
					>
						<div class="px-3 py-1 bg-yellow-500">
							<DamageIcon class="w-10 h-10 text-black -rotate-90" />
							<p class="text-black font-extrabold text-3xl">
								- {latestAttackEvents[latestAttackEvents?.length - 1]?.defenderDamage}
							</p>
						</div>
					</div>
				{/if}
				{#if $healEvents?.length && $resolvedTransactions.length && $resolvedTransactions[0].status != 'Failed'}
					<div class={`absolute left-[30%] top-[30%]`} style="transform: scale({$scale});">
						<HealthIcon class="w-32 h-32 text-red-500 scale-animation" />
					</div>
				{/if}
				{#if $revivedEvents?.length && $resolvedTransactions.length && $resolvedTransactions[0].status != 'Failed'}
					<div
						class={'absolute left-[30%] top-[30%]  border border-red-500 w-full h-full '}
						style="transform: translateY({$translateY}%);"
					>
						<ReviveIcon class="w-32 h-32 text-slate-300 bounce-animation " />
					</div>
				{/if}
				<img class="rounded-lg w-80" src={$userNftChar?.image || ''} alt="SVG" />
			</div>
			<div>
				<p>Total XP: {$getXP}</p>
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
					disabled={($userCharStats?.life.toNumber() == 100 && $userCharStats?.alive == false) ||
						Number($getXP) < 65}
					on:click={(_) => {
						if ($userCharStats?.life.toNumber() != 100 && $userCharStats?.alive == true) {
							healNft();
						}
					}}
					class={'border  rounded-lg px-2 py-1 ' +
						(($userCharStats?.life.toNumber() == 100 && $userCharStats?.alive == false) ||
						Number($getXP) < 65
							? 'bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300'
							: 'bg-slate-200 hover:bg-slate-300 border-black')}>Heal (65xp)</button
				>
				<button
					disabled={$userCharStats?.alive == false}
					on:click={(_) => {
						if ($userCharStats?.alive == false) {
							reviveNft();
						}
					}}
					class={'border rounded-lg px-2 py-1 ' +
						($userCharStats?.alive == false
							? 'bg-slate-200 hover:bg-slate-300 border-black'
							: ' bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300 cursor-default')}
					>Revive (100xp)</button
				>
			</div>
		</div>
		<div class={'relative w-40 text-center z-50 ' + ($attackAnimation ? '' : 'hidden')}>
			<div
				style="opacity: {$opacity}; transform: translate({$positionXenemy}px, {$positionYenemy}px)"
				class={'absolute animation w-full flex items-center justify-start ' +
					($attackAnimation ? '' : 'inactive')}
			>
				<SwordIcon class="w-40 h-40 text-red-500 rotate-90" />
			</div>
			<div
				style="opacity: {$opacity}; transform: translate({$positionX}px, {$positionY}px)"
				class={'absolute animation w-full flex items-center justify-start ' +
					($attackAnimation ? '' : 'inactive')}
			>
				<SwordIcon class="w-40 h-40 text-blue-500 -rotate-90" />
			</div>
		</div>
		<div class="relative">
			{#if latestAttackEvents?.length && $resolvedTransactions.length && $resolvedTransactions[0].status != 'Failed'}
				<div
					style="transform: translate({$positionXdamage}px, {$positionYdamage}px)"
					class={'absolute animation w-full flex items-center justify-center space-x-4 ' +
						($xpAnimation ? '' : 'inactive hidden')}
				>
					<div class="px-3 py-1 bg-yellow-500">
						<DamageIcon class="w-10 h-10 text-black -rotate-90" />
						<p class="text-black font-extrabold text-3xl">
							- {latestAttackEvents[latestAttackEvents?.length - 1]?.attackDamage}
						</p>
					</div>
				</div>
			{/if}
			<img class="rounded-lg w-80" src={$enemyNftChar?.image || ''} alt="SVG" />
			<!-- <div>
				<p>Damage Dealt:</p>
				<p>XP Gained:</p>
				<p>Damage Taken:</p>
			</div> -->
		</div>
	</div>
</div>

<style>
	.animation {
		transition: opacity 0.5s ease-in-out;
	}

	.animation.inactive {
		transform: scale(0);
	}

	.scale-animation {
		width: 100px; /* Adjust the initial width as needed */
		height: 100px; /* Adjust the initial height as needed */
		transition: transform 1s ease-in-out;
	}

	.bounce-animation {
		width: 100%;
		height: 100%;
		background-color: blue; /* Example background color */
		transition: transform 1s ease-in-out;
	}
</style>
