import puppeteer from 'puppeteer';
import type { RequestHandler } from './$types';
import * as dotenv from 'dotenv';

dotenv.config();

const input = {
	username: process.env.printerUser,
	password: process.env.printerPassword
} as {username: string, password: string};

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		// if (!locals?.user?.id) {
		// 	return new Response(JSON.stringify({ message: 'Unauthorized' }), {
		// 		headers: {
		// 			'content-type': 'application/json; charset=utf-8'
		// 		},
		// 		status: 401
		// 	});
		// }

		const reqPdf = await request.json();

		/**
		 *	For receipt printing
		 * 	https://stackoverflow.com/questions/59464250/configure-pdf-page-width-using-puppeteer
		 */

		// Create a browser instance
		// headless: true
		const browser = await puppeteer.launch({
			headless: "new"
		});

		// Create a new page
		const page1 = await browser.newPage();

		await page1.goto('http://localhost:5173/', {
			waitUntil: ['domcontentloaded', 'networkidle0']
		});

		// Login
		await page1.type('#email', input.username);
		await page1.type('#password', input.password);
		await page1.click('#submit');
		await page1.waitForNavigation();

		// Get cookies
		const cookies = await page1.cookies();

		// Use cookies in another tab or browser
		const page = await browser.newPage();
		await page.setCookie(...cookies);

		//Get HTML content from HTML file
		await page.goto(`${reqPdf.url}${reqPdf.currency}/${reqPdf.id}`, {
			waitUntil: ['domcontentloaded', 'networkidle0']
		});

		// To reflect CSS used for screens instead of print
		await page.emulateMediaType('screen');

		// Download the PDF
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true
		});

		await browser.close();

		const pdf = {
			pdf: pdfBuffer.toString('base64')
		};

		return new Response(JSON.stringify(pdf), {
			headers: {
				'Content-Type': 'application/pdf'
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ message: `A server error occurred ${err}` }), {
			headers: {
				'content-type': 'application/json; charset=utf-8'
			},
			status: 500
		});
	}
};
