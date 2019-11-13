const util = require('util');
const request = require('request');
const cheerio = require('cheerio');

const url = 'https://www.lanuv.nrw.de/luqs/messorte/messorte.php';

const rp = util.promisify(request);

const run = async () => {
  try {
    const page = await rp(url);
    const body = page.body;

    const $ = cheerio.load(body);
    const tableRows = $('#wrapper > table > tbody > tr');

    $(tableRows).each(function (i, tableRow) {
      const data = $(tableRow).text().trim().split('\n');
      console.log(data);
    });
  } catch (error) {
    console.log('ERROR');
  }
}

run();