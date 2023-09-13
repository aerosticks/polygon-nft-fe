import { defaultEvmStores } from 'svelte-ethers-store';
// import { mainDefaultChainId } from 'src/utils/provider';
import { utils } from 'ethers';

export async function connectWallet(signerAddress: string) {
	try {
		await defaultEvmStores.setProvider();
		if (JSON.stringify(sessionStorage.getItem('accnt')) !== signerAddress)
			sessionStorage.setItem('accnt', signerAddress);
	} catch (error) {
		console.log(error, 'Something went wrong while connecting wallet');
	}
}

export async function switchNetwork() {
	await window?.ethereum.request({
		method: 'wallet_switchEthereumChain',
		// params: [{ chainId: '0x80001' }]
		params: [{ chainId: '0x13881' }]
	});
}

export async function addMumbaiNetwork() {
	await window?.ethereum
		.request({
			method: 'wallet_addEthereumChain',
			params: [
				{
					chainId: '0x80001',
					// chainId: utils.hexValue(80001),
					chainName: 'Mumbai Testnet',
					nativeCurrency: {
						name: 'Matic',
						symbol: 'MATIC',
						decimals: 18
					},
					rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
					blockExplorerUrls: ['https://mumbai.polygonscan.com/']
				}
			]
		})
		.then((res) => {
			console.log('Successfully added MUMBAI test network to Metamask');
		})
		.catch((err) => {
			console.error('Failed to add MUMBAI test network to Metamask\n', err);
		});
}
