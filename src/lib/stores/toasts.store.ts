import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

export interface toastInterface {
	message: string;
	type: 'success' | 'info' | 'warning' | 'error';
	id: string;
}

function createToast() {
	const { subscribe, set, update } = writable<toastInterface[]>([]);

	return {
		subscribe,
		add: ({
			message = 'Default message',
			type = 'info'
		}: {
			message: string;
			type: toastInterface['type'];
		}) => {
			const id = uuidv4();
			update((allToasts) => [{ id, message, type }, ...allToasts]);
		},
		remove: (id: string) =>
			update((allToasts: toastInterface[]) =>
				allToasts.filter((toast: toastInterface) => toast.id !== id)
			),
		reset: () => set([])
	};
}

export const toasts = createToast();
