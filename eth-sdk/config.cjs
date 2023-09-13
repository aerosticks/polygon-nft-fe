const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x7F1e599Fd2D123b9F2CfAd856376cB2A507015A1'
		}
	},
	outputPath: 'eth-sdk/build/'
});
