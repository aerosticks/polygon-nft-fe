import type { ContractTransaction } from 'ethers/lib/ethers';
import { provider, type Network } from 'src/utils';
import { writable, get } from 'svelte/store';

export const pendingTransactions = writable<{ hash: string; label: string }[]>([]);
export const resolvedTransactions = writable<{ hash: string; label: string; status: string }[]>([]);

// Function to add a transaction to the pendingTransactions store
export const addPendingTransaction = (label: string, hash: string) => {
	// console.log('adding pending txs ', hash);
	pendingTransactions.update((transactions) => [...transactions, { label, hash }]);
};

// Function to update a transaction's status in the resolvedTransactions store
export const updateTransactionStatus = (hash: string, status: string, label: string) => {
	// console.log('updating resolved txs ', hash, status, label);
	// Check if a transaction with the same hash already exists in resolvedTransactions
	const resolvedTxs = get(resolvedTransactions);
	const existingTx = resolvedTxs.find((tx) => tx.hash === hash);

	if (!existingTx) {
		// If the transaction doesn't exist, add it to resolvedTransactions
		resolvedTransactions.update((transactions) => [...transactions, { label, hash, status }]);
	}
};

// Function to get the label for a pending transaction by hash
export const getLabelForPendingTransaction = (hash: string) => {
	const transactions = get(pendingTransactions);
	const transaction = transactions.find((t) => t.hash === hash);
	return transaction ? transaction.label : '';
};

// Function to listen for Ethereum transactions and update their status
export const transactionListener = (chainId: string | number) => {
	provider(chainId as Network).addListener('block', async (blockNumber) => {
		const pendingTxs = get(pendingTransactions);
		// console.log('pending Txs 2', pendingTxs);
		for (const tx of pendingTxs) {
			try {
				const txReceipt = await provider(chainId as Network).getTransactionReceipt(tx.hash);
				// console.log('TX Receipt', txReceipt);

				if (txReceipt && txReceipt.confirmations > 0) {
					// console.log('update tx status', txReceipt);
					let pendingLabel = getLabelForPendingTransaction(tx.hash);
					updateTransactionStatus(
						tx.hash,
						txReceipt.status == 1 ? 'Confirmed' : 'Failed',
						pendingLabel
					);
					pendingTransactions.update((transactions) =>
						transactions.filter((transaction) => transaction.hash !== tx.hash)
					);
				}
			} catch (error) {
				console.error('Error checking transaction status:', error);
				let pendingLabel = getLabelForPendingTransaction(tx.hash);
				updateTransactionStatus(tx.hash, 'Failed', pendingLabel);
				pendingTransactions.update((transactions) =>
					transactions.filter((transaction) => transaction.hash !== tx.hash)
				);
			}
		}
	});
};

// Function to broadcast a transaction and add it to pendingTransactions
export const broadcastTransaction = async (
	label: string,
	txPromise: Promise<ContractTransaction>
) => {
	try {
		const tx = await txPromise;
		addPendingTransaction(label, tx.hash);
		// console.log('pending tx 1', tx);
		return tx;
	} catch (error) {
		console.error('Error broadcasting transaction:', error);
		throw error; // Rethrow the error to handle it elsewhere if needed
	}
};
