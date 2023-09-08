const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x6652Fce06A0c0C7397f396B6C0D259B2e7fcc8b1'
		}
	},
	outputPath: 'eth-sdk/build/'
});
