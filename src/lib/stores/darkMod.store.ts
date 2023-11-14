import { writable } from "svelte/store";
import { browser } from '$app/environment';


export type StoredTheme = 'dark' | 'light'

function themeFunc() {
  const { subscribe, set, update } = writable<StoredTheme>('light');

  return {
    subscribe,
    add: (theme: StoredTheme) => {
      update(() => theme)
    },
    reset: () => set('light')
  };
}

export const userManuallyChangedTheme = themeFunc()
