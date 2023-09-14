import { writable } from 'svelte/store';

export const eventMintTrigger = writable(false);
export const eventTrainTrigger = writable(false);
export const eventAttackTrigger = writable(false);
export const eventXPTrigger = writable(false);
export const eventBurnTrigger = writable(false);
export const eventHealTrigger = writable(false);
export const eventReviveTrigger = writable(false);
export const eventKilledTrigger = writable(false);
