export function selectTextOnFocus(node: HTMLInputElement | HTMLTextAreaElement) {
	const handleFocus = () => {
		node && typeof node.select === 'function' && node.select();
	};

	node.addEventListener('focus', handleFocus);

	return {
		destroy() {
			node.removeEventListener('focus', handleFocus);
		}
	};
}

/** Blurs the node when Escape is pressed */
export function blurOnEscape(node: HTMLInputElement | HTMLTextAreaElement) {
	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && node && typeof node.blur === 'function') node.blur();
	};

	node.addEventListener('keydown', handleKey as EventListener);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKey as EventListener);
		}
	};
}
