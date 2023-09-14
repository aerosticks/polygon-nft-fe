const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x057C2D44c3106C4098253ad9539818F4e7CD98D7'
		}
	},
	outputPath: 'eth-sdk/build/'
});
