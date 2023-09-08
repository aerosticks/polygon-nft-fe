<script lang="ts">
	import {
		chainId,
		defaultEvmStores,
		connected,
		provider,
		signer,
		signerAddress
	} from 'svelte-ethers-store';
	import abi from 'eth-sdk/abis/polygonMumbai/CHAINBATTLES.json';
	import { sdk } from 'src/stores/eth-sdk';
	import { mintCharEvents, type MintedEvents } from 'src/hooks/events';
	import { getCharacterNFT, getTokenURI, getAllTokenURI } from 'src/hooks/characters';
	import { connectWallet } from 'src/utils/wallet';

	// $: console.log('CONTRACT\n', $sdk.CHAINBATTLES);
	$: console.log('MINT', $mintCharEvents);
	$: console.log('owner address ', mintedEvents[0]?.owner);

	// $: nft = getCharacterNFT(1);
	// $: console.log('CHAR STATS token 1', $nft);

	$: nftURI = getTokenURI(1);

	// $: mintedEvents = $mintCharEvents || [];
	$: mintedEvents = sortByOwner($mintCharEvents || []) || [];
	$: console.log('MINTED by Owner ', mintedEvents || []);

	$: ownerTokenIds = filterOwnerTokenIds($mintCharEvents || []);
	$: console.log('OWNER TOKENS ', ownerTokenIds);

	$: ownerURIs = getAllTokenURI(filterOwnerTokenIds($mintCharEvents || []));
	$: console.log('URIS\n', $ownerURIs);

	function sortByOwner(eventsMint) {
		let ownerEvents = eventsMint?.filter((mint) => mint.owner == $signerAddress);
		return ownerEvents;
	}

	function filterOwnerTokenIds(mintEvents) {
		let tokenIds = mintEvents.map((mint) => mint.tokenId);
		return tokenIds;
	}
</script>

<div>
	<button
		class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' +
			($connected ? ' ' : 'hidden ')}
		on:click={(_) => {
			defaultEvmStores.disconnect();
			sessionStorage.removeItem('accnt');
		}}>Diconnect</button
	>
	<button
		class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' +
			($connected ? 'hidden ' : ' ')}
		on:click={(_) => {
			connectWallet($signerAddress);
		}}>Connect</button
	>
	<h1>Chain Battles NFT Gallery</h1>

	{#if $ownerURIs?.length}
		<div class="flex justify-center space-x-3 m-6">
			{#each mintedEvents as mintEvent, index}
				<div class="border rounded-lg p-2 bg-slate-200 w-fit text-center">
					<div class="w-48 h-48 m-4">
						<!-- {#await getTokenURI(Number(mintEvent.tokenId)) then nftImage}
					<p>{nftImage.image}</p>
					<img class="rounded-lg" src={nftImage?.image} alt="SVG" />
				{/await} -->
						<img class="rounded-lg" src={$ownerURIs[index]?.image || ''} alt="SVG" />
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
