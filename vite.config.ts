import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
// import { imagetools } from 'vite-imagetools';

export default defineConfig({
	// plugins: [sveltekit(), imagetools()],
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		host: true
	}
});
