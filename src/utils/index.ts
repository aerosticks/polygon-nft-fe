import { BigNumber, type BigNumberish } from 'ethers';
import type { Web3Provider, JsonRpcSigner } from '@ethersproject/providers';
import { commify as com } from 'ethers/lib/utils.js';
import { readable } from 'svelte/store';

export * from 'src/utils/provider';

// format an ERC20 amount as a number with 2 decimals
export const formatAmount = (amount: BigNumberish, ERC20decimals: number) => {
	if (!amount) return 0;
	return (
		BigNumber.from(amount)
			.div(BigNumber.from(10).pow(ERC20decimals - 3))
			.toNumber() / 1000
	);
};

export const getSigner = (library: Web3Provider, account: string): JsonRpcSigner => {
	return library.getSigner(account).connectUnchecked();
};

export const getProviderOrSigner = (
	library: Web3Provider,
	account?: string
): Web3Provider | JsonRpcSigner => {
	return account ? getSigner(library, account) : library;
};

export const gasAmount = () => {
	// if (!process.env.production) {
	//   return {gasLimit: 1000000};
	// }
	return { gasLimit: 1000000 };
};

export const commify = (value: any, decimals?: number, priceAndUnitDisplay?: boolean) => {
	if (value == 'NaN' || value == 'Infinity' || (value != 0 && !value)) return '0.00';
	// if (typeof value == 'number') {
	// 	// return com(value?.toFixed(decimals || 2) || 0);
	// }

	if (priceAndUnitDisplay) {
		if (Number(value) >= 10 || Number(value) == 0) {
			decimals = 2;
		} else if (Number(value) < 10 && Number(value) >= 0.5) {
			decimals = 4;
		} else if (Number(value) < 0.5 && Number(value) >= 0.05) {
			decimals = 6;
		} else if (Number(value) < 0.05 && Number(value) >= 0.0005) {
			decimals = 8;
		} else if (Number(value) < 0.0005 && Number(value) >= 0.000005) {
			decimals = 12;
		}
	}

	// return com((Number(value) || 0).toFixed(decimals || 2));
	let commfiedResult = Number(parseFloat(String(value)).toFixed(decimals || 2)).toLocaleString(
		'en'
	);
	if (commfiedResult.indexOf('.') == -1) {
		commfiedResult += '.';
		for (let i = decimals || 2; i != 0; i--) {
			commfiedResult += '0';
		}
	}

	if (commfiedResult.length - commfiedResult.indexOf('.') - 1 < (decimals || 2)) {
		let decimalsInValue = commfiedResult.length - commfiedResult.indexOf('.') - 1;
		for (let i = (decimals || 2) - decimalsInValue; i != 0; i--) {
			commfiedResult += '0';
		}
	}

	return commfiedResult;
};

export type TimeRemaining = {
	expired: boolean;
	total: number; // total time remaining in seconds
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

export function formatTime(seconds?: any): string {
	if (seconds && seconds < 0) seconds = 0;
	return new Date((seconds || 0) * 1000).toISOString().substr(11, 8);
}

// @params endDate in unix timestamp
export function getTimeRemaining(endDate?: number): TimeRemaining {
	if (!endDate) {
		return {
			expired: false,
			total: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0
		};
	}
	const total = Math.abs(endDate - Date.now() / 1000);
	const expired = endDate - Date.now() / 1000 < 0;
	const days = Math.floor(total / (24 * 3600));
	const daysRest = total % (24 * 3600);
	const hours = Math.floor(daysRest / 3600);
	const hoursRest = daysRest % 3600;
	const minutes = Math.floor(hoursRest / 60);
	const minutesRest = hoursRest % 60;
	const seconds = Math.floor(minutesRest / 60);

	return {
		expired,
		total,
		days,
		hours,
		minutes,
		seconds
	};
}

export const THREE_MONTHS_IN_SECONDS = 3 * 31 * 24 * 3600;

export function roundToDecimal(number: number, decimalPlaces: number) {
	const factor = 10 ** decimalPlaces;
	return Math.round(number * factor) / factor;
}
