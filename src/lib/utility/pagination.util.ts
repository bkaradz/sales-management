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
}

export const getPagination = (queryParams: any) => {
	
	let limit: Limit = isNaN(+queryParams?.limit) ? 13 : +queryParams?.limit;
	if (limit < 1 ) limit = 1
	let page: Page = isNaN(+queryParams?.page) ? 1 : +queryParams?.page;
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
		totalRecords: 0
	} as Pagination;
};
