const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x2a83f6137C6C6D31612d2C88dC2b1D6C1d16a7bb'
		}
	},
	outputPath: 'eth-sdk/build/'
});
