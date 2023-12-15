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

export function longPress(node: HTMLButtonElement, threshold = 50) {
	const handle_mousedown = () => {
		
		const timeout = setInterval(() => {
			node.dispatchEvent(new CustomEvent('longPress'));
		}, threshold);
		
		const cancel = () => {
			clearInterval(timeout);
			node.removeEventListener('mousemove', cancel);
			node.removeEventListener('mouseup', cancel);
		};
		
		node.addEventListener('mousemove', cancel);
		node.addEventListener('mouseup', cancel);
	}
	
	node.addEventListener('mousedown', handle_mousedown);
	
	return {
		destroy() {
			node.removeEventListener('mousedown', handle_mousedown);
		}
	};
}