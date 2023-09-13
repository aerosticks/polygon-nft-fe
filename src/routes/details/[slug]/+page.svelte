<script lang="ts">
	import { page } from '$app/stores';
	import { getCharacterNFT, getTokenURI, getAllTokenURI, getXP, getRequiredXP } from 'src/hooks/characters';
    import { mintCharEvents, attackEvents, burnedEvents, trainedEvents, xpGainedEvents, type MintedEvents } from 'src/hooks/events';
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
    import HealthIcon from `~icons/healthicons/health`;

    import EnemyDetails from 'src/routes/details/enemy.svelte';
	import { onMount } from 'svelte';
	import { eventTrainTrigger, eventAttackTrigger, eventBurnTrigger, eventXPTrigger } from 'src/routes/nfts/store';

    $: console.log('XP\n', $getXP)

	// $: console.log('PAGE DATA', $page.params.slug);
    $: console.log('attacks', $attackEvents)
	$: console.log('XP GAINED EVENTS', $xpGainedEvents)

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

    function levelUp() {
        // enough xp to train to next level
        $sdk?.CHAINBATTLES?.connect($signer).train($nftChar?.id).then(res => console.log('train token ', res)).catch(err => console.warn('issue training',err));
    }

    function fightNft(enemyTokenId: number) {
        // attack the nft and rotate image to display history of events
        console.log('fight tokens', Number($nftChar?.id), Number(enemyTokenId))
        $sdk.CHAINBATTLES?.connect($signer).attack(Number($nftChar?.id), Number(enemyTokenId)).then(res => console.log('start fight', res)).catch(err => console.warn('error fighting', err));
    }

	onMount(() => {
		if(!$sdk || !$sdk.CHAINBATTLES || !EVENTS_CHAINBATTLES) return;

		const handleLevelEvent = (tokenId: Number, newLevel: Number, remainingXP: Number) => {
			const levelUp = {tokenId, newLevel, remainingXP};
			console.log('new level up event', levelUp);
			eventTrainTrigger.update(value => !value)
		}

		const handleFightEvent = (attackerTokenId: number, victimTokenId: number, damage: number) => {
			const fighting = {attackerTokenId, victimTokenId, damage};
			console.log('new fight event', fighting);
			eventAttackTrigger.update(value => !value);
		}

		const handleXpEvent = (owner: string, xpPoints: number) => {
			const gainXP = {owner, xpPoints};
			console.log('new xp event', gainXP);
			eventXPTrigger.update(value => !value);
		}

		const handleBurnEvent = (tokenId: number) => {
			const burning = {tokenId};
			console.log('new burn event', burning);
			eventBurnTrigger.update(value => !value)
		}

		const levelFilter = EVENTS_CHAINBATTLES.filters.Trained();
		const fightFilter = EVENTS_CHAINBATTLES.filters.Attacked();
		const xpFilter = EVENTS_CHAINBATTLES.filters.XPgained();
		const burnFilter = EVENTS_CHAINBATTLES.filters.Burned();

		EVENTS_CHAINBATTLES.on(levelFilter, handleLevelEvent);
		EVENTS_CHAINBATTLES.on(fightFilter, handleFightEvent);
		EVENTS_CHAINBATTLES.on(xpFilter, handleXpEvent);
		EVENTS_CHAINBATTLES.on(burnFilter, handleBurnEvent);

		return () => {
			EVENTS_CHAINBATTLES.off(levelFilter, handleLevelEvent);
			EVENTS_CHAINBATTLES.off(fightFilter, handleFightEvent);
			EVENTS_CHAINBATTLES.off(xpFilter, handleXpEvent);
			EVENTS_CHAINBATTLES.off(burnFilter, handleBurnEvent);
		}
	})
</script>

<div>
	<div class="pb-3">
		<h1>Token Details</h1>
	</div>

	<div class="flex items-center justify-center space-x-6">
		<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center">
			<div class="w-48 h-fit m-4 space-y-2">
				<!-- <img class="rounded-lg" src={$nftURI?.image || ''} alt="SVG" /> -->
				<p>ID: {$nftChar?.id || ''}</p>
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
						<progress class="border border-black w-[90%]" max="100" value={$nftChar?.life || 0} />
					</div>
				</div>
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
			<div>
				<p class="text-xs">XP points available: {$getXP}</p>
				<button
					on:click={(_) => levelUp()}
					disabled={!$connected ||
						$signerAddress != $nftChar?.owner ||
						Number($getXP) < Number($requiredXP)}
					class={'border border-black bg-slate-200 hover:bg-slate-300 rounded-lg px-4 py-1 ' +
						(!$connected ||
						$signerAddress != $nftChar?.owner ||
						Number($getXP) < Number($requiredXP)
							? ' text-gray-400 cursor-not-allowed border-gray-400 bg-slate-100 hover:bg-slate-100'
							: '')}>Train</button
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
			<div class="flex justify-center space-x-3 space-y-3 m-6 w-full flex-wrap">
				{#each mintedEvents as mintEvent, index}
					<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center">
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
							<button
								on:click={(_) => fightNft(mintEvent.tokenId)}
								disabled={!$connected || $signerAddress == mintEvent.owner}
								class={'border border-black rounded-lg px-2 py-1 bg-slate-200 hover:bg-slate-300 ' +
									(!$connected || $signerAddress == mintEvent.owner
										? ' text-gray-400 cursor-not-allowed border-gray-400 bg-slate-100 hover:bg-slate-100'
										: '')}>Fight</button
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
