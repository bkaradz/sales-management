import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';

dotenv.config();

const input = {
    username: process.env.printerUser,
    password: process.env.printerPassword
} as { username: string, password: string };

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    printPdf: async (event) => {
        console.log("🚀 ~ file: +page.server.ts:19 ~ printPdf: ~ event:", 
        event.request.headers.get('cookie')
        )

        const session = await event.locals.auth.validate()

        if (!session) {
            throw redirect(303, "/auth/login")
        }

        const data = await event.request.formData();
        const formData = Object.fromEntries(data)

        const origin = formData.origin as string
        const pathname = formData.pathname as string
        const urlArray = []
        urlArray.push(origin)
        urlArray.push(pathname)
        const url = urlArray.join('')
        
        try {

            const browser = await puppeteer.launch({
                headless: "new"
            });

            // Create a new page
            const page1 = await browser.newPage();

            await page1.goto(`${origin}`, {
                waitUntil: ['domcontentloaded', 'networkidle0']
            });

            // Login
            await page1.type('#username', input.username);
            await page1.type('#password', input.password);
            await page1.click('#submit');
            await page1.waitForNavigation();

            // Get cookies
            const cookies = await page1.cookies();

            const page = await browser.newPage();
            await page.setCookie(...cookies);

            //Get HTML content from HTML file
            await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'] });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType('print');

            // Download the PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                printBackground: true
            });

            await browser.close();

            const pdf = {
                pdf: pdfBuffer.toString('base64')
            };

            return {
                success: true,
                data: JSON.stringify(pdf),
            };
        } catch (err) {
            console.error("🚀 ~ file: +page.server.ts:60 ~ printPdf: ~ err:", err)
            return {
                errors: true,
                message: "Failed to generate PDF"
            }
        }
    }
}

const printPDF = async (url: string) => {

};
