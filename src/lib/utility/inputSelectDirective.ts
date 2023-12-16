import type { Action } from "svelte/action";


export function selectTextOnFocus(element: HTMLInputElement | HTMLTextAreaElement) {
	const handleFocus = () => {
		element && typeof element.select === 'function' && element.select();
	};

	element.addEventListener('focus', handleFocus);

	return {
		destroy() {
			element.removeEventListener('focus', handleFocus);
		}
	};
}

/** Blurs the node when Escape is pressed */
export function blurOnEscape(element: HTMLInputElement | HTMLTextAreaElement) {
	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && element && typeof element.blur === 'function') element.blur();
	};

	element.addEventListener('keydown', handleKey as EventListener);

	return {
		destroy() {
			element.removeEventListener('keydown', handleKey as EventListener);
		}
	};
}

interface Attribute {
	'on:longPress'?: (event: CustomEvent) => void
}

// TODO: correct the any threshold type to number
export const longPress: Action<HTMLElement, any, Attribute> = (element, threshold = 100) => {
	const handle_mousedown = () => {
		
		const timeout = setInterval(() => {
			element.dispatchEvent(new CustomEvent('longPress'));
		}, threshold);
		
		const cancel = () => {
			clearInterval(timeout);
			element.removeEventListener('mousemove', cancel as EventListener);
			element.removeEventListener('mouseup', cancel as EventListener);
		};
		
		element.addEventListener('mousemove', cancel);
		element.addEventListener('mouseup', cancel);
	}
	
	element.addEventListener('mousedown', handle_mousedown as EventListener);
	
	return {
		destroy() {
			element.removeEventListener('mousedown', handle_mousedown as EventListener);
		}
	};
}