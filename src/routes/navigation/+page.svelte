<script lang="ts">
	import { page } from '$app/stores';
	import {
		chainId,
		defaultEvmStores,
		connected,
		provider,
		signer,
		signerAddress
	} from 'svelte-ethers-store';
	import { connectWallet, switchNetwork } from 'src/utils/wallet';

	$: console.log('CHAIN ID', $chainId);
</script>

<div class="py-4 flex items-center justify-between">
	<div>CB logo</div>
	<div class="space-x-4 tabs tabs-boxed">
		<a
			href="/"
			class="!border-primary tab text-black"
			class:font-bold={$page.route?.id?.endsWith('/')}
			class:!text-primary={$page.route?.id?.endsWith('/')}
			class:text-base-100={!$page.route?.id?.endsWith('/')}
			class:tab-active={$page.route?.id?.endsWith('/')}>Home</a
		>
		<a
			href="/nfts"
			class="!border-primary tab text-black"
			class:font-bold={$page.route?.id?.startsWith('/nfts')}
			class:!text-primary={$page.route?.id?.startsWith('/nfts')}
			class:text-base-100={!$page.route?.id?.startsWith('/nfts')}
			class:tab-active={$page.route?.id?.startsWith('/nfts')}>NFTs</a
		>
		<a
			href="/faucet"
			class="!border-primary tab text-black"
			class:font-bold={$page.route?.id?.startsWith('/faucet')}
			class:!text-primary={$page.route?.id?.startsWith('/faucet')}
			class:text-base-100={!$page.route?.id?.startsWith('/faucet')}
			class:tab-active={$page.route?.id?.startsWith('/faucet')}>Faucet</a
		>
	</div>
	<div>
		<button
			class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' +
				($connected ? ' ' : 'hidden ')}
			on:click={(_) => {
				defaultEvmStores.disconnect();
				sessionStorage.removeItem('accnt');
			}}>Disconnect</button
		>
		<button
			class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' +
				($connected ? 'hidden ' : ' ')}
			on:click={(_) => {
				connectWallet($signerAddress);
			}}>Connect</button
		>
		<button
			class={'border p-2 rounded-lg hover:bg-slate-300 bg-slate-200 ' +
				($chainId == 80001 || !$connected ? 'hidden ' : ' ')}
			on:click={(_) => {
				switchNetwork();
			}}>Switch to Mumbai</button
		>
	</div>
</div>
