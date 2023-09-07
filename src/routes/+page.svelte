<script>
	import { chainId, connected, defaultEvmStores, signerAddress } from 'svelte-ethers-store';
	import { connectWallet, switchNetwork, addMumbaiNetwork } from 'src/utils/wallet';
	// import { mainDefaultChainId } from 'src/utils/provider';

	$: console.log('Chain ID ', $chainId);
</script>

<section class="space-y-4">
	<h1>Welcome to Polygon (Mumbai) NFT - Chain Battles</h1>
	<button
		class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' + ($connected ? 'hidden ' : '')}
		on:click={(_) => connectWallet($signerAddress)}
	>
		Connect Wallet to Enter
	</button>
	<!-- <button
		class={'border p-2 rounded-lg hover:bg-slate-300 ' +
			($chainId != 80001 && $connected ? ' ' : 'hidden')}
		on:click={(_) => switchNetwork()}
	>
		Switch Networks
	</button>
	<div class="hover:underline cursor-pointer text-xs" on:click={(_) => addMumbaiNetwork()}>
		<p>Add Polygon Mumbai test network to metamask</p>
	</div> -->
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
