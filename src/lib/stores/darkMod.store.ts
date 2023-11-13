import { writable } from "svelte/store";
import { browser } from '$app/environment';


type StoredTheme = 'light' | 'dark'

function themeFunc() {
  let initTheme: StoredTheme = 'dark'
  if (browser) initTheme = localStorage.getItem("theme") as StoredTheme | null || 'dark'
  const { subscribe, set, update } = writable<StoredTheme>(initTheme);

  return {
    subscribe,
    add: (theme: StoredTheme) => {
      update((storedTheme) => {
        if (browser) {
          localStorage.setItem("theme", theme === 'dark' ? 'dark' : 'light');
          if (theme === 'light') {
            storedTheme = theme
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
          }
          if (theme === 'dark') {
            storedTheme = theme
            document.documentElement.classList.remove('light')
            document.documentElement.classList.add('dark')
          }
        }
        return storedTheme
      })
    },
    reset: () => set('dark')
  };
}

export const theme = themeFunc()
// type StoredTheme = 'light' | 'dark'
// let storedTheme: StoredTheme = 'dark'
// if (browser) {
//   const localStorageTheme = localStorage.getItem("theme")
//   if (localStorageTheme === 'light') {
//     storedTheme = localStorageTheme
//     document.documentElement.classList.remove('dark')
//     document.documentElement.classList.add('light')
//   }
//   if (localStorageTheme === 'dark') {
//     storedTheme = localStorageTheme
//     document.documentElement.classList.remove('light')
//     document.documentElement.classList.add('dark')
//   }
// }
// export const theme = writable(storedTheme);
theme.subscribe(value => {
  if (browser) localStorage.setItem("theme", value === 'dark' ? 'dark' : 'light');
});