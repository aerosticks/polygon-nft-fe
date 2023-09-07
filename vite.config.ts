import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), Icons({ compiler: 'svelte', autoInstall: true, prefix: false })],
	ssr: {
		noExternal: ['cross-fetch', 'svelte-proxied-store', 'lodash']
	},
	server: {
		fs: {
			allow: ['eth-sdk', 'static']
		}
	},
	resolve: {
		alias: {
			src: ['/src'],
			'eth-sdk': ['/eth-sdk']
			// ["ethers/lib/utils"]: ["ethers/lib/utils.js"]
		}
	}
};

export default config;
