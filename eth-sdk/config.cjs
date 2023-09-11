const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x3E1aF451494163d1a698E8b8f9E30b4904087F00'
		}
	},
	outputPath: 'eth-sdk/build/'
});
