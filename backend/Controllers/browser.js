// src/Controllers/browser.js
import puppeteer from "puppeteer";

let browserInstance = null;

export async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("🚀 Browser launched");
  }
  return browserInstance;
}
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    console.log("🛑 Browser closed");
  }
}
