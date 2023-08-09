import { parseString } from '@fast-csv/parse';

export default function parseCsv(csvString: string) {
	return new Promise((resolve, reject) => {
		const data: unknown[] = [];

		parseString(csvString, {
			// headers: (headers) => headers.map((h) => h?.toLowerCase())
			headers: (headers) => headers.map((h) => h)
		})
			.on('error', reject)
			.on('data', (row) => data.push(row))
			.on('end', () => {
				resolve(data);
			});
	});
}
