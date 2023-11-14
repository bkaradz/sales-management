import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

export interface toastInterface {
	message: string;
	type: 'success' | 'info' | 'warning' | 'error';
	id: string;
}

export let timeout = 5000;

let timeoutMap = new Map<string, NodeJS.Timeout>()

function createToast() {
	const { subscribe, set, update } = writable<toastInterface[]>([]);

	return {
		subscribe, update,
		add: ({
			message = 'Default message',
			type = 'info'
		}: {
			message: string;
			type: toastInterface['type'];
		}) => {
			const id = uuidv4();
			update((allToasts) => [{ id, message, type }, ...allToasts]);
			const timeoutId = setTimeout(() => dismissToast(id), timeout)
			timeoutMap.set(id, timeoutId)
		},
		remove: (id: string) => dismissToast(id),
		reset: () => set([])
	};
}

export const toasts = createToast();

export const dismissToast = (id: string) => {
	toasts.update((allToasts: toastInterface[]) =>
		allToasts.filter((toast: toastInterface) => toast.id !== id)
		)
		clearTimeout(timeoutMap.get(id))
		timeoutMap.delete(id)
};