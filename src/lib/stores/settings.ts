import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
	soundEnabled: boolean;
	strokeWidth: number;
	speechRate: number;
	parentPin: string;
}

const defaultSettings: Settings = {
	soundEnabled: true,
	strokeWidth: 4,
	speechRate: 0.8,
	parentPin: '1234'
};

function createSettings() {
	// ローカルストレージから読み込み
	const stored = browser ? localStorage.getItem('kana-master-settings') : null;
	const initial = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;

	const { subscribe, set, update } = writable<Settings>(initial);

	return {
		subscribe,
		set: (value: Settings) => {
			if (browser) {
				localStorage.setItem('kana-master-settings', JSON.stringify(value));
			}
			set(value);
		},
		update: (fn: (s: Settings) => Settings) => {
			update((s) => {
				const newValue = fn(s);
				if (browser) {
					localStorage.setItem('kana-master-settings', JSON.stringify(newValue));
				}
				return newValue;
			});
		},
		reset: () => {
			if (browser) {
				localStorage.removeItem('kana-master-settings');
			}
			set(defaultSettings);
		}
	};
}

export const settings = createSettings();
