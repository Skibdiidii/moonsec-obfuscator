const google = require('googlethis');
google.search('roblox blade ball workspace script github', { page: 0, safe: false, parse_ads: false }).then(res => console.log(JSON.stringify(res.results.slice(0,3), null, 2))).catch(console.error);
