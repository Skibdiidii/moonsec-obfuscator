const scraper = require('ddg-scraper');
const ddg = new scraper();
ddg.searchData('roblox blox fruits workspace script github').then(console.log).catch(console.error);
