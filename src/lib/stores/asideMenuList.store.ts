import { readable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { svgContacts, svgDashboard, svgGear, svgProductList, svgSales } from '$lib/assets/svgLogos';

const anchorTags = [
	{
		id: uuidv4(),
		url: '/',
		name: 'Dashboard',
		icon: svgDashboard
	},
	{
		id: uuidv4(),
		url: '/contacts',
		name: 'Contacts',
		icon: svgContacts
	},
	{
		id: uuidv4(),
		url: '/products',
		name: 'Products',
		icon: svgProductList
	},
	{
		id: uuidv4(),
		url: '/cart',
		name: 'Cart',
		icon: svgProductList
	},
	{
		id: uuidv4(),
		url: '/sales',
		name: 'Sales',
		icon: svgSales
	},
	{
		id: uuidv4(),
		url: '/settings',
		name: 'Settings',
		icon: svgGear
	},
	
];

export const anchorTagsList = readable(anchorTags);
