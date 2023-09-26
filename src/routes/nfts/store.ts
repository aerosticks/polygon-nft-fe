import { writable } from 'svelte/store';

export const eventMintTrigger = writable(false);
export const eventTrainTrigger = writable(false);
export const eventAttackTrigger = writable(false);
export const eventXPTrigger = writable(false);
export const eventBurnTrigger = writable(false);
export const eventHealTrigger = writable(false);
export const eventReviveTrigger = writable(false);
export const eventKilledTrigger = writable(false);

export const attackAnimation = writable(false);
export const healAnimation = writable(false);
export const reviveAnimation = writable(false);
export const xpAnimation = writable(false);
export const killAnimation = writable(false);
export const mintAnimation = writable(false);
