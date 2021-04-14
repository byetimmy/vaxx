'use strict';

const request = require('request-promise');
const cheerio = require('cheerio');
const config = require('./config');

const STATIC = {
    VACC: {
        URL: `${config.BASE_SITE}${config.BASE_URI}`,
        REFERER: config.BASE_SITE,
        MIN_AVAIL: config.MIN_AVAIL
    },
    USERAGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
};


const massage_ = function (txt) {
    txt = txt.replace(/\n/g, '');
    txt = txt.replace(/\t/g, ' ');
    while (txt.indexOf('  ') > -1) {
        txt = txt.replace(/  /g, ' ');
    }
    return txt.trim();
}

async function ajax(uri) {
    const $ = await request({
        uri,
        headers: {
            'referer': STATIC.VACC.REFERER,
            'user-agent': STATIC.USERAGENT
        },
        transform: function (body) {
            return cheerio.load(body);
        }
    });

    return Promise.resolve($);
}


async function getVaccItems() {
    let results = [];

    //VACC
    console.log(`Getting VACC info...`);

    let idx = 1;
    let doNext = true;

    while (doNext) {
        try {
            const url = STATIC.VACC.URL.replace(/\{page\}/gi, idx++);
            const $ = await ajax(url);

            const booked = $(`p strong:contains(${config.BASE_MATCH})`);
            
            for (let i = 0; i < booked.length; i++) {

                const pNode = booked[i].parentNode.parentNode;
                const button = $('.button-primary:contains(Sign Up)', pNode)[0];
                const numBooked = massage_($(`p strong:contains(${config.BASE_MATCH})`, pNode).parent().text());
                const count = parseInt(numBooked.split(': ')[1], 10);

                if (button && count >= STATIC.VACC.MIN_AVAIL) {
                    const buttonHref = config.BASE_SITE + $(button).attr('href');

                    const $$ = await ajax(buttonHref);

                    //if this error is on the page, that means no slots are actually there
                    const error_message = $$('.danger-alert')[0];
                    if (!error_message) {
                        //we've got something here.  Add it
                        const loc = massage_($('p:eq(0)', pNode).text());
                        const date_avail = loc.split(' on ')[1];
                        const location = loc.split(' on ')[0];
                        const address = massage_($('p:eq(1)', pNode).text());
                        const offered = massage_($('p:eq(2)', pNode).text()).split(': ')[1].split(' COVID-19 Vaccine')[0];;

                        const _pk = `${offered}::${date_avail}::${location}`;
                        results.push({
                            count,
                            address,
                            url: buttonHref,
                            location,
                            date_avail,
                            offered,
                            _pk
                        });
                    }
                }
            }

            if ($('.page.next.disabled').length > 0) {
                doNext = false;
            }

        } catch (e) {
            console.log('ERROR:', e);
            doNext = false;
        }
    }

    console.log(`Available VACC Results Found: ${results.length}.`);

    return Promise.resolve(results);
}


module.exports = {
    getVaccItems
}