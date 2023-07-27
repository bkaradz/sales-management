type Limit = number | string;
type Page = number | string;
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
	const limit: Limit = isNaN(+queryParams?.limit) ? 15 : +queryParams?.limit;
	const page: Page = isNaN(+queryParams?.page) ? 1 : +queryParams?.page;

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
