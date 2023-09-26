const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x4fb5309a38a1a8f0a0f07c98a25682f0729D97E6'
		}
	},
	outputPath: 'eth-sdk/build/'
});
