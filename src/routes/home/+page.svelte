<script lang="ts">
	import { chainId, defaultEvmStores, connected } from 'svelte-ethers-store';
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
</div>
