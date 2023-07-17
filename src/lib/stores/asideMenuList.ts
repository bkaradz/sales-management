import { readable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';


import { svgBag, svgDashboard, svgFolder, svgHome } from '$lib/assets/svgLogos';

const anchorTags = [
	{
		id: uuidv4(),
		url: '/',
		name: 'Dashboard',
		icon: svgHome
	},
	{
		id: uuidv4(),
		url: '/contacts',
		name: 'Customer',
		icon: svgBag
	},
	{
		id: uuidv4(),
		url: '/contacts',
		name: 'Customer',
		icon: svgFolder
	},
	{
		id: uuidv4(),
		url: '/products',
		name: 'Products',
		icon: svgDashboard
	},
];

export const anchorTagsList = readable(anchorTags);
