<script lang="ts">
	import { chainId, defaultEvmStores, connected, provider, signer } from 'svelte-ethers-store';
	import abi from 'eth-sdk/abis/polygonMumbai/CHAINBATTLES.json';
	import { sdk } from 'src/stores/eth-sdk';
	import { mintCharEvents, type MintedEvents } from 'src/hooks/events';

	$: console.log('CONTRACT\n', $sdk.CHAINBATTLES.connect($signer));
	$: console.log('MINT', $mintCharEvents);

	$: mintedEvents = $mintCharEvents || [];
</script>

<div>
	<button
		class="border p-2 rounded-lg hover:bg-slate-300 bg-slate-200"
		on:click={(_) => {
			defaultEvmStores.disconnect();
			sessionStorage.removeItem('accnt');
		}}>Diconnect</button
	>
	<h1>this is the home page</h1>

	{#each mintedEvents as mintEvent}
		<div class="border rounded-lg p-2 bg-slate-200">
			<p>
				owner: {mintEvent.owner}
			</p>
			<p>
				token id: {mintEvent.tokenId}
			</p>
		</div>
	{/each}
</div>
