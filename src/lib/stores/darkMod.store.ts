import { writable } from "svelte/store";


export type StoredTheme = 'dark' | 'light' | null

function themeFunc() {
  const { subscribe, update } = writable<StoredTheme>(null);

  return {
    subscribe,
    add: (theme: StoredTheme) => {
      update(() => theme)
      document.cookie = `siteTheme=${theme};max-age=31536000;path="/"`
    }
  };
}

export const userManuallyChangedTheme = themeFunc()
