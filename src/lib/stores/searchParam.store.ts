import { browser } from '$app/environment';
import { writable } from 'svelte/store';


function create_search_param(initial_value, init = true) {

    if (init) initial_value = localStorage.getItem('key') ?? initial_value

    const { subscribe, set: _set, update: _update } = writable(initial_value);

    return {
        subscribe,
        set(new_value) {
            localStorage.setItem('key', JSON.stringify(new_value) )
            _set(new_value)
        }
        
    };
}

export const toasts = create_search_param({}, browser);
