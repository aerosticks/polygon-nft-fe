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

	// $: console.log('CONTRACT\n', $sdk.CHAINBATTLES);
	$: console.log('MINT', $mintCharEvents);
	$: console.log('owner address ', mintedEvents[0]?.owner);

	$: nft = getCharacterNFT(1);
	$: console.log('CHAR STATS token 1', $nft);

	// $: nftURI = getTokenURI(1);

	// $: mintedEvents = $mintCharEvents || [];
	$: mintedEvents = $connected ? sortByOwner($mintCharEvents || []) : $mintCharEvents || [];
	$: console.log('MINTED by Owner ', mintedEvents || []);

	$: ownerTokenIds = filterOwnerTokenIds($mintCharEvents || []);
	$: console.log('OWNER TOKENS ', ownerTokenIds);

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
</script>

<div>
	<h1>Chain Battles - My NFT Gallery</h1>

	<div class="w-full flex items-center justify-center">
		<button
			disabled={!$connected}
			class={'border border-black bg-slate-200 hover:bg-slate-300 px-2 py-1 ' +
				(!$connected ? 'text-gray-400 cursor-not-allowed bg-slate-100 hover:bg-slate-100' : '')}
			on:click={(_) => {
				$sdk?.CHAINBATTLES?.connect($signer).mint();
			}}
		>
			Mint a new NFT
		</button>
	</div>

	{#if $ownerURIs?.length}
		<div class="flex justify-center space-x-3 m-6">
			{#each mintedEvents as mintEvent, index}
				<div class="border border-black rounded-lg p-2 bg-slate-200 w-fit text-center">
					<div class="w-48 h-48 m-4">
						<a href={'/details/' + mintEvent.tokenId}>
							<img class="rounded-lg" src={$ownerURIs[index]?.image || ''} alt="SVG" />
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
