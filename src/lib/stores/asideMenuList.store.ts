import { readable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { svgCart, svgContacts, svgDashboard, svgGear, svgProductList, svgProduction, svgProduction2, svgSales } from '$lib/assets/svgLogos';

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
		icon: svgCart
	},
	{
		id: uuidv4(),
		url: '/sales',
		name: 'Sales',
		icon: svgSales
	},
	{
		id: uuidv4(),
		url: '/production',
		name: 'Production',
		icon: svgProduction2
	},
	{
		id: uuidv4(),
		url: '/settings',
		name: 'Settings',
		icon: svgGear
	},
	
];

export const anchorTagsList = readable(anchorTags);
