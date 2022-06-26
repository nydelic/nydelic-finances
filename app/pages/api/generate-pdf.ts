// POLISH: implement serverside pdf generation

// import { NextApiRequest, NextApiResponse } from "next";
// // import puppeteer from "puppeteer";
// import { Readable } from "stream";
// import chromium from "chrome-aws-lambda";

// const generatePDF = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (typeof req.body.path !== "string") {
//     res.status(400).json({ error: "No valid path provided." });
//     res.end();
//     return;
//   }

//   const host =
//     process.env.NODE_ENV === "development"
//       ? "http://localhost:3000"
//       : "https://nydelic-invoices.nydelic.vercel.app";
//   try {
//     // const browser = await puppeteer.launch();
//     // // Launch a new browser session.
//     // // const browser = await puppeteer.launch();
//     const browser = await chromium.puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath,
//       headless: chromium.headless,
//       ignoreHTTPSErrors: true,
//     });
//     // Open a new Page.
//     const page = await browser.newPage();

//     // Go to our invoice page that we serve on `localhost:8000`.
//     await page.goto(`${host}${req.body.path}`);
//     await page.addStyleTag({
//       content: `
//         html {
//           -webkit-print-color-adjust: exact;
//         }
//       `,
//     });
//     // timeout for animations to complete
//     await new Promise<void>((res) =>
//       setTimeout(() => {
//         res();
//       }, 2000)
//     );
//     // Store the PDF in a file named `invoice.pdf`.
//     const pdf = await page.pdf({
//       format: "A4",
//       margin: { top: 20, left: 20, bottom: 20, right: 20 },
//     });
//     res.writeHead(200, {
//       "Content-Type": "application/pdf",
//       "Content-Length": pdf.length,
//     });

//     const readableInstanceStream = new Readable({
//       read() {
//         this.push(pdf);
//         this.push(null);
//       },
//     });

//     readableInstanceStream.pipe(res);

//     await browser.close();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Something went wrong." });
//   } finally {
//     res.end();
//     return;
//   }
// };

// export default generatePDF;

export default async function generatePDF() {}
