import type { PageServerLoad } from './$types';

function wait(ms: number) {
	return new Promise((r) => {
		setTimeout(r, ms);
	});
}

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

/** @type {import('./$types').Actions} */
export const actions = {
	async default({ request, fetch }) {
		const form_data = await request.formData();
		const search = form_data.get('search') ?? '';
		const result = await fetch('https://jsonplaceholder.typicode.com/posts').then((res) =>
			res.json()
		);
		const posts = result.filter((post: any) =>
			post.title.toLowerCase().includes(search.toString().toLowerCase())
		);
		for (let post of posts) {
			await wait(100);
		}
		return { posts, search };
	}
};