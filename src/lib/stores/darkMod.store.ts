import { writable } from "svelte/store";


type Mode = 'light' | 'dark'

function themeModeSelected() {
  const { subscribe, set, update } = writable<Mode>('light');

  return {
    subscribe,
    add: (mode: Mode) => { update(() => mode) },
    reset: () => set('light')
  };
}

export const themeModeSelectedStore = themeModeSelected()