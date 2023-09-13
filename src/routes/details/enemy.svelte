<script lang="ts">
	import { getCharacterNFT, getTokenURI, getAllTokenURI } from 'src/hooks/characters';
	import {
		mintCharEvents,
		attackEvents,
		type MintedEvents,
		type AttackedEvents
	} from 'src/hooks/events';
	import {
		chainId,
		defaultEvmStores,
		connected,
		provider,
		signer,
		signerAddress
	} from 'svelte-ethers-store';
	import { flip } from 'svelte/animate';

	export let tokenId: number;

	let showImage = true;

	function toggle() {
		showImage = !showImage;
	}

	$: console.log('ENEMY TOKENID ', tokenId);

	$: nftURI = getTokenURI(Number(tokenId));

	$: console.log('enemy uri', $nftURI);

	$: tokenAttacks = sortTokenAttacks($attackEvents || []);

	function sortTokenAttacks(allAttacks: AttackedEvents[]) {
		let sorted = allAttacks.filter((attack) => attack.victim == tokenId);
		return sorted;
	}

	$: nftDetails = showImage
		? [{ id: tokenId, image: $nftURI?.image }]
		: [{ id: 2, content: tokenAttacks }];
</script>

{#each nftDetails as item (item.id)}
	<div
		role="button"
		tabindex="0"
		on:click={(_) => toggle()}
		on:keypress={() => {}}
		class="w-48 h-48 border rounded-lg p-2 border-white bg-slate-200 overflow-y-auto"
	>
		{#if showImage}
			<img class="rounded-lg" src={item?.image || ''} alt="SVG" />
		{:else}
			<p>Battle Report</p>
			{#each item?.content as attack}
				<p class="text-xs">NFT #{attack.attacker} does {attack.attackDamage} damage!</p>
			{/each}
		{/if}
	</div>
{/each}
