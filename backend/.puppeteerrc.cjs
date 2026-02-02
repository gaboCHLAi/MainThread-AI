const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // This tells Puppeteer EXACTLY where to install and look for Chrome
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
