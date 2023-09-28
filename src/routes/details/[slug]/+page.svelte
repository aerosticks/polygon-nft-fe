<script lang="ts">
	import { page } from '$app/stores';
	import { getCharacterNFT, getTokenURI, getAllTokenURI, getXP, getRequiredXP } from 'src/hooks/characters';
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

    import StrongIcon from `~icons/mdi/arm-flex`;
    import SpeedIcon from `~icons/mdi/rabbit`;
	import HealthIcon from `~icons/solar/health-bold`;
	import ReviveIcon from `~icons/game-icons/angel-outfit`;
	import TrainIcon from `~icons/icon-park/dumbbell`;

    import EnemyDetails from 'src/routes/details/enemy.svelte';
	import { onMount } from 'svelte';
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
		killAnimation,
		trainAnimation
	} from 'src/routes/nfts/store';
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
	import { goto } from '$app/navigation';

	import { tweened } from 'svelte/motion';
	import { spring } from 'svelte/motion';
	import { cubicIn, cubicOut, cubicInOut } from 'svelte/easing';
	import { broadcastTransaction, resolvedTransactions } from 'src/stores/transactions';
	import { attackGasEstimate, healGasEstimate, reviveGasEstimate, trainGasEstimate } from 'src/hooks/gas';
	import { type BigNumberish } from 'ethers';

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

	const translateY2 = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut,
	});

	// Function to toggle the bounce animation
	function toggleBounce2() {
		setTimeout(() => {
		translateY2.set(-20); 
		setTimeout(() => {
			translateY2.set(0, { duration: 1000 }); 
			toggleBounce2(); // Repeat the animation
		}, 1000); 
		}, 1000); 
	}

	// $: console.log('SDK', $sdk)
    // $: console.log('XP\n', $getXP)

	// $: userXP = getXP(signerAddress);

	// $: console.log('PAGE DATA', $page.params.slug);
    // $: console.log('attacks', $attackEvents)
	// $: console.log('XP GAINED EVENTS', $xpGainedEvents)

	$: nftURI = getTokenURI(Number($page?.params?.slug));
	$: nftChar = getCharacterNFT(Number($page?.params?.slug));

    $: requiredXP = getRequiredXP(Number($page?.params?.slug))

	// $: console.log('CHAR STATS', $nftChar);
	// $: console.log('NFT URI', $nftURI);

    $: mintedEvents = $connected ? sortByOwner($mintCharEvents || []) : $mintCharEvents || [];
	$: console.log('MINTED by Owner ', mintedEvents || []);

	$: ownerTokenIds = filterOwnerTokenIds($mintCharEvents || []);
	$: console.log('OWNER TOKENS ', ownerTokenIds);

	$: ownerURIs = getAllTokenURI(filterOwnerTokenIds($mintCharEvents || []));
	$: console.log('URIS\n', $ownerURIs);

	function sortByOwner(eventsMint: MintedEvents[]) {
		let ownerEvents = eventsMint?.filter((mint) => mint.owner != $signerAddress);
		return ownerEvents;
	}

	function filterOwnerTokenIds(mintEvents: MintedEvents[]) {
		let tokenIds = mintEvents.map((mint) => mint.tokenId);
		return tokenIds;
	}

    

    function fightNft(enemyTokenId: number) {
        // attack the nft and rotate image to display history of events
        console.log('fight tokens', Number($nftChar?.id), Number(enemyTokenId))
        $sdk.CHAINBATTLES?.connect($signer).attack(Number($nftChar?.id), Number(enemyTokenId)).then(res => console.log('start fight', res)).catch(err => console.warn('error fighting', err));
    }

	function startFight(enemyTokenId: number) {
		console.log('go to page to start fight')
		goto(`/fight/${$nftChar?.id}/${enemyTokenId}`)
	}

	// onMount(() => {
	// 	if(!$sdk || !$sdk.CHAINBATTLES || !EVENTS_CHAINBATTLES) return;

	// 	const handleLevelEvent = (tokenId: Number, newLevel: Number, remainingXP: Number) => {
	// 		const levelUp = {tokenId, newLevel, remainingXP};
	// 		console.log('new level up event', levelUp);
	// 		eventTrainTrigger.update(value => !value)
	// 	}

	// 	const handleFightEvent = (attackerTokenId: number, victimTokenId: number, damage: number) => {
	// 		const fighting = {attackerTokenId, victimTokenId, damage};
	// 		console.log('new fight event', fighting);
	// 		eventAttackTrigger.update(value => !value);
	// 	}

	// 	const handleXpEvent = (owner: string, xpPoints: number) => {
	// 		const gainXP = {owner, xpPoints};
	// 		console.log('new xp event', gainXP);
	// 		eventXPTrigger.update(value => !value);
	// 	}

	// 	const handleBurnEvent = (tokenId: number) => {
	// 		const burning = {tokenId};
	// 		console.log('new burn event', burning);
	// 		eventBurnTrigger.update(value => !value)
	// 	}

	// 	const levelFilter = EVENTS_CHAINBATTLES.filters.Trained();
	// 	const fightFilter = EVENTS_CHAINBATTLES.filters.Attacked();
	// 	const xpFilter = EVENTS_CHAINBATTLES.filters.XPgained();
	// 	const burnFilter = EVENTS_CHAINBATTLES.filters.Burned();

	// 	EVENTS_CHAINBATTLES.on(levelFilter, handleLevelEvent);
	// 	EVENTS_CHAINBATTLES.on(fightFilter, handleFightEvent);
	// 	EVENTS_CHAINBATTLES.on(xpFilter, handleXpEvent);
	// 	EVENTS_CHAINBATTLES.on(burnFilter, handleBurnEvent);

	// 	return () => {
	// 		EVENTS_CHAINBATTLES.off(levelFilter, handleLevelEvent);
	// 		EVENTS_CHAINBATTLES.off(fightFilter, handleFightEvent);
	// 		EVENTS_CHAINBATTLES.off(xpFilter, handleXpEvent);
	// 		EVENTS_CHAINBATTLES.off(burnFilter, handleBurnEvent);
	// 	}
	// })

	const healGasEstimateStore = healGasEstimate(Number($page?.params?.slug));
	let healGas: BigNumberish;
	healGasEstimateStore.subscribe((value) => {
		healGas = value;
	});

	const reviveGasEstimateStore = reviveGasEstimate(
		Number($page?.params?.slug)
	);
	let reviveGas: BigNumberish;
	reviveGasEstimateStore.subscribe((value) => {
		reviveGas = value;
	});

	const trainGasEstimateStore = trainGasEstimate(
		Number($page?.params?.slug)
	);
	let trainGas: BigNumberish;
	trainGasEstimateStore.subscribe(value => {
		trainGas = value;
	})

	function levelUp() {
        // enough xp to train to next level
		console.log('TRAIN TOKEN ID ', Number($nftChar?.id))
		broadcastTransaction(
			'Training',

			$sdk.CHAINBATTLES?.connect($signer).train(Number($nftChar?.id))
		).then(res => {
			
			console.log('train token ', res)
			eventTrainTrigger.update(value => !value);
			trainAnimation.update(value => value = true)
		}).catch(err => console.warn('issue training',err))
    }

	function healNft() {
		console.log('healing token ', Number($page?.params?.slug));
		broadcastTransaction(
			'Healing',

			$sdk.CHAINBATTLES?.connect($signer).heal(Number($page?.params?.slug), { gasLimit: healGas })
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
		console.log('reviving token ', Number($page?.params?.slug));
		broadcastTransaction(
			'Reviving',

			$sdk.CHAINBATTLES.connect($signer).revive(Number($page?.params?.slug), {
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

	onMount(() => {
		toggleScale();
		toggleBounce();
		toggleBounce2();
	});
</script>

<div>
	<div class="pb-3">
		<h1>Token Details</h1>
	</div>

	<div class="flex items-center justify-center space-x-6">
		<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center">
			<div class="w-48 h-fit m-4 space-y-2 relative">
				{#if $healEvents?.length && $healAnimation}
					<div class={`absolute left-[20%] top-[20%]`} style="transform: scale({$scale});">
						<HealthIcon class="w-32 h-32 text-red-500 scale-animation" />
					</div>
				{/if}
				{#if $revivedEvents?.length && $reviveAnimation}
					<div
						class={'absolute left-[20%] top-[20%] w-full h-full '}
						style="transform: translateY({$translateY}%);"
					>
						<ReviveIcon class="w-32 h-32 text-slate-300 bounce-animation " />
					</div>
				{/if}
				{#if $trainedEvents?.length && $trainAnimation}
					<div
						class={'absolute left-[20%] top-[20%] w-full h-full '}
						style="transform: translateY({$translateY2}%);"
					>
						<TrainIcon class="w-32 h-32 text-white bounce-animation " />
					</div>
				{/if}
				<img class="rounded-lg" src={$nftURI?.image || ''} alt="SVG" />
				<!-- <p>ID: {$nftChar?.id || ''}</p>
				<p>Class: {$nftChar?.class || ''}</p>
				<div>
					<p>Level: {$nftChar?.level || ''}</p>
					<p class="text-[8px]">xp needed for next level: {$requiredXP}</p>
				</div>

				<div class="pt-4">
					<div class="flex items-center justify-center space-x-6">
						<div class="flex items-center space-x-1">
							<StrongIcon class="w-6" />
							<p>{$nftChar?.strength || ''}</p>
						</div>
						<div class="flex items-center space-x-1">
							<SpeedIcon class="w-6" />
							<p>{$nftChar?.speed || ''}</p>
						</div>
					</div>
					<div class="flex items-center space-x-1">
						<HealthIcon class="w-6" />
						<progress
							class="border border-black w-[90%]"
							max="100"
							value={$nftChar?.life.toNumber() || 0}
						/>
					</div>
				</div> -->
			</div>
			<p class="text-xs">
				owner:
				<a
					href={`https://mumbai.polygonscan.com/address/` + $nftChar?.owner}
					target="_blank"
					rel="noreferrer"
					class="text-xs no-underline hover:underline text-blue-500"
				>
					{$nftChar?.owner.slice(0, 6)} ... {$nftChar?.owner.slice(-4)}
				</a>
			</p>
		</div>

		<div class="space-y-6">
			<div class="flex flex-col space-y-2">
				<p class="text-xs">XP points available: {$getXP?.xpAmount.toNumber()}</p>
				<button
					on:click={(_) => {
						levelUp();
					}}
					disabled={!$connected ||
						$signerAddress != $nftChar?.owner ||
						Number($getXP?.xpAmount.toNumber()) < Number($requiredXP)}
					class={'border  rounded-lg px-2 py-1 ' +
						(!$connected ||
						$signerAddress != $nftChar?.owner ||
						Number($getXP?.xpAmount.toNumber()) >= Number($requiredXP)
							? 'bg-slate-200 hover:bg-slate-300 border-black'
							: ' bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300 cursor-default')}
					>Train ({Number($requiredXP)}xp)</button
				>
				<button
					on:click={(_) => {
						healNft();
					}}
					disabled={!$connected ||
						$signerAddress != $nftChar?.owner ||
						$nftChar?.life.toNumber() == 100 ||
						$nftChar?.alive == false ||
						Number($getXP?.xpAmount.toNumber()) < Number($getXP?.healNeededAmount.toNumber())}
					class={'border  rounded-lg px-2 py-1  ' +
						(!$connected ||
						$signerAddress != $nftChar?.owner ||
						$nftChar?.life.toNumber() == 100 ||
						$nftChar?.alive == false ||
						Number($getXP?.xpAmount.toNumber()) < Number($getXP?.healNeededAmount.toNumber())
							? 'bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300'
							: 'bg-slate-200 hover:bg-slate-300 border-black')}
					>Heal ({Number($getXP?.healNeededAmount.toNumber())}xp)</button
				>
				<button
					on:click={(_) => {
						reviveNft();
					}}
					disabled={!$connected ||
						$signerAddress != $nftChar?.owner ||
						$nftChar?.alive == true ||
						Number($getXP?.xpAmount.toNumber()) < Number($getXP?.reviveNeededAmount.toNumber())}
					class={'border rounded-lg px-2 py-1  ' +
						(!$connected ||
						$signerAddress != $nftChar?.owner ||
						$nftChar?.alive == false ||
						Number($getXP?.xpAmount.toNumber()) >= Number($getXP?.reviveNeededAmount.toNumber())
							? 'bg-slate-200 hover:bg-slate-300 border-black'
							: ' bg-slate-100 hover:bg-slate-100 text-slate-300 border-slate-300 cursor-default')}
					>Revive ({Number($getXP?.reviveNeededAmount.toNumber())}xp)</button
				>
			</div>

			<!-- <div>
				<p class="text-xs">Fight random enemy</p>
				<button class="border border-black bg-slate-200 hover:bg-slate-300 rounded-lg px-4 py-1">
					Fight
				</button>
			</div> -->
			<!-- <div>
				<button class="border border-black bg-slate-200 hover:bg-slate-300 rounded-lg px-4 py-1">
					Revive
				</button>
			</div> -->
		</div>
	</div>

	<div class="mt-10">
		<h1 class="text-lg font-bold">Enemy List</h1>

		<!-- <div>minted nfts not by this owner</div> -->
		{#if $ownerURIs?.length}
			<div class="flex justify-center space-x-3 m-6 w-full flex-wrap">
				{#each mintedEvents as mintEvent, index}
					<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center my-2">
						<!-- <div class="w-48 h-48 m-4">
							<img class="rounded-lg" src={$ownerURIs[index]?.image || ''} alt="SVG" />
						</div> -->
						<EnemyDetails tokenId={mintEvent.tokenId} />
						<p class="text-xs">
							owner:
							<a
								href={`https://mumbai.polygonscan.com/address/` + mintEvent.owner}
								target="_blank"
								rel="noreferrer"
								class="text-xs no-underline hover:underline text-blue-500"
							>
								{mintEvent.owner.slice(0, 6)} ... {mintEvent.owner.slice(-4)}
							</a>
						</p>
						<div class="my-2">
							<!-- <button
								on:click={(_) => {
									// fightNft(mintEvent.tokenId);
									startFight(mintEvent.tokenId);
								}}
								disabled={!$connected || $signerAddress == mintEvent.owner}
								class={'border border-black rounded-lg px-2 py-1 bg-slate-200 hover:bg-slate-300 ' +
									(!$connected || $signerAddress == mintEvent.owner
										? ' text-gray-400 cursor-not-allowed border-gray-400 bg-slate-100 hover:bg-slate-100'
										: '')}>Fight</button
							> -->
							<a
								href={`/fight/${$nftChar?.id}/${mintEvent.tokenId}`}
								class={'border border-black rounded-lg px-2 py-1 bg-slate-200 hover:bg-slate-300  text-black ' +
									(!$connected || $signerAddress == mintEvent.owner
										? ' text-gray-400 cursor-not-allowed border-gray-400 bg-slate-100 hover:bg-slate-100'
										: '')}>Fight</a
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
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
