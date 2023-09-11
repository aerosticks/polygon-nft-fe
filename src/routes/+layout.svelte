<script>
	import './styles.css';

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { chainId, defaultEvmStores, connected } from 'svelte-ethers-store';
	import { goto } from '$app/navigation';

	import NavBar from 'src/routes/navigation/+page.svelte';

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
</script>

<div class="app">
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
