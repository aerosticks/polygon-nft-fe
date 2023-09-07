const sdk = require('@dethcrypto/eth-sdk');

module.exports = sdk.defineConfig({
	contracts: {
		polygonMumbai: {
			CHAINBATTLES: '0x4F4a6719608Aa80E6e35Ea24d640735eb8039fB2'
		}
	},
	outputPath: 'eth-sdk/build/'
});
