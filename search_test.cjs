const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://raw.githubusercontent.com/1201For/V.G-Hub/main/Blade-Ball', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(r => console.log(r.data.substring(0, 500)))
  .catch(console.error);
