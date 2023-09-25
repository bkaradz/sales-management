import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const library = ['cherry', 'lime', 'berry', 'salad']

	// your search logic goes here
	const query = url.searchParams.get('search')
	const flavours = library.filter(el => el.includes(query))

	// artificial delay
	await new Promise((res, rej) => {
		setTimeout(res, 1000)
	})

	return {
		flavours
	};
}) satisfies PageServerLoad;