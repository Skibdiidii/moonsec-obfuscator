const fetch = require('node-fetch');
fetch('https://api.github.com/search/code?q=workspace+blade+ball+extension:lua', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.json()).then(console.log);
