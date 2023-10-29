import type { SearchParams } from "$lib/validation/searchParams.validate";

type Limit = number;
type Page = number;

export type Previous = { page: number; limit: number } | undefined;
export type Current = { page: number; limit: number };
export type Next = { page: number; limit: number } | undefined;

export interface Pagination {
	next: Next;
	previous: Previous;
	current: Current;
	limit: number;
	endIndex: number;
	page: number;
	totalPages: number;
	totalRecords: number;
	search: string | undefined
}

export const getPagination = (queryParams: SearchParams) => {

	let limit: Limit
	let page: Page 
	
	if (queryParams?.limit) {
		limit = +queryParams?.limit;
	} else {
		limit = 13
	}

	if (limit < 1 ) limit = 1

	if (queryParams?.page) {
		page = +queryParams?.page;
	} else {
		page =  1 
	}

	if (page < 1 ) page = 1

	const startIndex: number = (page - 1) * limit;
	const endIndex: number = page * limit;

	let previous: Previous = undefined;
	const next: Next = {
		page: page + 1,
		limit
	};

	const current: Current = {
		page: page,
		limit
	};

	if (startIndex > 0) {
		previous = {
			page: page - 1,
			limit
		};
	}

	return {
		next,
		previous,
		current,
		limit,
		endIndex,
		page,
		totalPages: 0,
		totalRecords: 0,
		search: queryParams.search
	} as Pagination;
};
