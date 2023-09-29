<script lang="ts">
	import './styles.css';

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { chainId, defaultEvmStores, connected } from 'svelte-ethers-store';
	import { goto } from '$app/navigation';
	import { transactionListener } from 'src/stores/transactions';
	import { pendingTransactions, resolvedTransactions } from 'src/stores/transactions';
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
		mintAnimation,
		eventMintTrigger,
		trainAnimation
	} from 'src/routes/nfts/store';

	import NavBar from 'src/routes/navigation/+page.svelte';

	import CloseIcon from `~icons/ei/close-o`;

	$: console.log('chain ID ', $chainId)

	const idToChain: any = {
	80001: 'mumbai'
};

	onMount(() => {
		// defaultEvmStores.setProvider();
		if (browser) {
			if (sessionStorage.getItem('accnt')?.length) {
				// console.log('found our session storage');
				defaultEvmStores.setProvider();

				// console.log('PAGE\n', $page);
			} else {
				// defaultEvmStores.setProvider();
			}
		} else {
			console.log('window not found');
			// defaultEvmStores.setProvider();
		}
	});

	// $: if ($connected && $page.route.id == '/') {
	// 	console.log('current page id', $page.route.id);
	// 	if (window?.ethereum) {
	// 		goto('/home');
	// 	}
	// }

	// $: if (!$connected && $page.route.id != '/') {
	// 	goto('/');
	// }
	function removeResolvedTransaction(index: number) {
		resolvedTransactions.update((transactions) => {
			return transactions.filter((_, i) => i !== index);
		});
	}

	function addTimerToRemoveItem(index: number) {
		setTimeout(() => {
			resolvedTransactions.update((transactions) => {
				return transactions.filter((_, i) => i !== index);
			});
		}, 10000); // 10 seconds in milliseconds
	}

	$: transactionListener($chainId);

	function stopAnimations() {
		eventKilledTrigger.update(value => value = false);
		eventAttackTrigger.update(value => value = false);
		eventBurnTrigger.update(value => value = false);
		eventHealTrigger.update(value => value = false);
		eventReviveTrigger.update(value => value = false);
		eventTrainTrigger.update(value => value = false);
		eventXPTrigger.update(value => value = false);
		eventMintTrigger.update(value => value = false);
		attackAnimation.update(value => value = false);
		healAnimation.update(value => value = false);
		reviveAnimation.update(value => value = false);
		mintAnimation.update(value => value = false);
		trainAnimation.update(value => value = false);
	}

	$: if($resolvedTransactions.length) {
		console.log('resolved txs available')
		$resolvedTransactions.forEach(item => {
			console.log('checking resolved txs')
			stopAnimations()
			// if(item.status == 'Failed') {
			// }
		});
	}
</script>

<div class="app">
	<div class="fixed z-50 bottom-4 right-4">
		{#each $resolvedTransactions as rt, index (index)}
			{#if rt.status == 'Confirmed'}
				<div class="p-4 rounded-lg bg-green-400 m-2 text-white">
					<div class="flex justify-end">
						<button
							class=" text-white text-xs w-4 h-4"
							on:click={(_) => {
								console.log('remove confirmed notification at index ', index);
								removeResolvedTransaction(index);
							}}
						>
							<CloseIcon />
						</button>
					</div>
					<div class="">{rt.label} {rt.status}</div>
					<a
						class="block text-xs text-right underline"
						target="_blank"
						rel="noreferrer"
						href={'https://' + idToChain[$chainId] + '.polygonscan.com/tx/' + rt.hash}
					>
						View on Explorer
					</a>
				</div>
			{:else}
				<div class="p-4 rounded-lg bg-red-400 m-2 text-white">
					<div class="flex justify-end">
						<button
							class=" text-white text-xs w-4 h-4"
							on:click={(_) => {
								console.log('remove failed notification at index ', index);
								removeResolvedTransaction(index);
							}}
						>
							<CloseIcon />
						</button>
					</div>
					<div class="">{rt.label} {rt.status}</div>
					<a
						class="block text-xs text-right underline"
						target="_blank"
						rel="noreferrer"
						href={'https://' + idToChain[$chainId] + '.polygonscan.com/tx/' + rt.hash}
					>
						View on Explorer
					</a>
				</div>
			{/if}
			{#await addTimerToRemoveItem(index)}{/await}
		{/each}
	</div>

	<NavBar />
	<main>
		<slot />
	</main>

	<footer />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		margin-left: 4rem;
		margin-right: 4rem;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
