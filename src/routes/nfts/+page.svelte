<script lang="ts">
	import {
		chainId,
		defaultEvmStores,
		connected,
		provider,
		signer,
		signerAddress
	} from 'svelte-ethers-store';
	import { mintCharEvents, type MintedEvents } from 'src/hooks/events';
	import { getCharacterNFT, getTokenURI, getAllTokenURI } from 'src/hooks/characters';
	import { sdk } from 'src/stores/eth-sdk';
	import { onMount } from 'svelte';
	import { eventMintTrigger, mintAnimation } from 'src/routes/nfts/store';
	import { EVENTS_CHAINBATTLES } from 'src/utils/single-provider';
	import { pendingTransactions, resolvedTransactions } from 'src/stores/transactions';
	import { broadcastTransaction } from 'src/stores/transactions';
	import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import {mintGasEstimate} from 'src/hooks/gas'

	import HammerIcon from `~icons/game-icons/thor-hammer`;
	import { BigNumber, ethers } from 'ethers';

	$: console.log('RESOLVED TXS', $resolvedTransactions);
	$: console.log('PENDING TXS ', $pendingTransactions);

	let mintGas = $mintGasEstimate;

	// $: console.log('CONTRACT\n', $sdk.CHAINBATTLES);
	$: console.log('MINT', $mintCharEvents);
	$: console.log('owner address ', mintedEvents[0]?.owner);

	$: nft = getCharacterNFT(1);
	$: console.log('CHAR STATS token 1', $nft);

	// $: nftURI = getTokenURI(1);

	// $: mintedEvents = $mintCharEvents || [];
	$: mintedEvents =
		$connected && $signerAddress ? sortByOwner($mintCharEvents || []) : $mintCharEvents || [];
	$: console.log('MINTED by Owner ', mintedEvents || []);

	// $: ownerTokenIds = filterOwnerTokenIds($mintCharEvents || []);
	// $: console.log('OWNER TOKENS ', ownerTokenIds);

	$: ownerURIs = getAllTokenURI(filterOwnerTokenIds($mintCharEvents || []));
	$: console.log('URIS\n', $ownerURIs);

	function sortByOwner(eventsMint: MintedEvents[]) {
		let ownerEvents = eventsMint?.filter((mint) => mint.owner == $signerAddress);
		return ownerEvents;
	}

	function filterOwnerTokenIds(mintEvents: MintedEvents[]) {
		let tokenIds = mintEvents.map((mint) => mint.tokenId);
		return tokenIds;
	}

	// onMount(() => {
	// 	if (!$sdk || !$sdk.CHAINBATTLES || !EVENTS_CHAINBATTLES) return;

	// 	// Define the event listener function
	// 	const handleMintEvent = (owner: string, tokenId: number) => {
	// 		const minting: MintedEvents = { owner, tokenId };
	// 		console.log('new MINT EVENT', minting);
	// 		eventMintTrigger.update((value) => !value);
	// 	};

	// 	const mintedFilter = EVENTS_CHAINBATTLES.filters.Minted();

	// 	EVENTS_CHAINBATTLES.on(mintedFilter, handleMintEvent);

	// 	return () => {
	// 		// Remove the event listener when the component is destroyed
	// 		EVENTS_CHAINBATTLES.off(mintedFilter, handleMintEvent);
	// 	};
	// });

	// Create a tweened variable for the rotation angle
	const rotation = tweened(0, {
		duration: 1000, // Adjust duration as needed
		easing: cubicOut,
	});

	// Function to toggle the rotation animation
	function toggleRotation() {
		setTimeout(() => {
		rotation.set(45); // Rotate 45 degrees
		setTimeout(() => {
			rotation.set(0); // Reset rotation to 0 degrees
			toggleRotation(); // Repeat the animation
		}, 1000); // 1000 milliseconds = 1 second (duration of 1 rotation)
		}, 1000); // 2000 milliseconds = 2 seconds (repeat every 2 seconds)
	}

	// Start the toggleRotation function when the component mounts
	onMount(() => {
		toggleRotation();
	});
</script>

<div>
	{#if $connected}
		<h1>Chain Battles - My NFT Gallery</h1>
	{:else}
		<h1>Chain Battles - NFT Gallery</h1>
	{/if}

	<div class="w-full my-4 flex items-center justify-center relative">
		<button
			disabled={!$connected}
			class={'border border-black bg-slate-200 hover:bg-slate-300 px-2 py-1 ' +
				(!$connected ? 'text-gray-400 cursor-not-allowed bg-slate-100 hover:bg-slate-100' : '')}
			on:click={(_) => {
				broadcastTransaction(
					'Minting',
					$sdk?.CHAINBATTLES.connect($signer).mint({ gasLimit: mintGas })
				)
					.then((res) => {
						console.log('start minting', res);
						eventMintTrigger.update((value) => !value);
						mintAnimation.update((value) => (value = true));
					})
					.catch((err) => console.warn('error minting', err));
			}}
		>
			Mint a new NFT
		</button>

		<div
			class={'hammerContainer ' + ($mintAnimation ? '' : 'hidden')}
			style="transform: rotate({$rotation}deg);"
		>
			<HammerIcon class="w-20 h-20 text-green-500 rotate-animation -rotate-90" />
		</div>
	</div>

	<div class="m-6">
		{#if $ownerURIs?.length}
			<div class="flex justify-center space-x-3 w-full flex-wrap">
				{#each mintedEvents as mintEvent, index}
					<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center my-2">
						<div class="w-48 h-48 m-4">
							<a href={'/details/' + mintEvent.tokenId}>
								<img
									class="rounded-lg"
									src={$ownerURIs[mintEvent.tokenId - 1]?.image || ''}
									alt="SVG"
								/>
							</a>
						</div>
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
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.hammerContainer {
		position: absolute;
		left: 60%;
	}
	.rotate-animation {
		width: 100px;
		height: 100px;
		transition: transform 1s ease-in-out;
	}
</style>
