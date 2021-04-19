'use strict';
require('dotenv').config();

const config = require('./config');
const utils = require('./utils');
const message = require('./message');
const express = require('express');
const path = require('path');
const moment = require('moment-timezone');
const app = express();
const port = config.PORT;
const pkg = require('../package.json');

const STATIC = {
    TEXT: {
        MAIN: `New Available Openings: {TOTAL_COUNT}
--------
{ITEMS}
Data scanned from ${config.BASE_SITE}`,
        ITEM: `Date: {date_avail}
Vaxx: {offered}
Available: {count}
Register: {url}
Location: {location}
Address: {address}
--------
`
    }
};

let storedLookup = {};
let storedResults = [];
let storedLastUpdated = new Date().getTime();

async function getItemData() {
    return storedResults;
}

async function setItemData() {

    let items = await utils.getVaccItems();

    //something errored on the site, just skkip processing
    if (items.data.length === 0 && items.errors.length > 0) {
        return;
    }

    let results = items.data;

    let lookup = {};
    let newResults = [];

    for (let i = 0; i < results.length; i++) {
        const itm = results[i];

        //check to see if we need to flag this as new
        if (!storedLookup[itm._pk] || storedLookup[itm._pk] < itm.count) {
            newResults.push(itm);
        }

        lookup[itm._pk] = itm.count;
    }


    if (newResults.length > 0) {
        //send email
        console.log('There are new appointments.  Send email...');

        const output = getOutputText(newResults);
        
        message.sendMessage(output);

    } else {
        console.log('No new appointments found.  Skipping email.');
    }

    storedLookup = lookup;
    storedResults = results;
    storedLastUpdated = new Date().getTime();

}

function _getOutput(data, typ) {
    let output = STATIC[typ].MAIN;
    
    let iTotal = 0;
    let items = [];
    
    for (let i = 0; i < data.length; i++) {
        const itm = data[i];

        iTotal += itm.count;

        let tmp = STATIC[typ].ITEM;
        for (let prop in itm) {
            tmp = tmp.replace(new RegExp (`\{${prop}\}`, 'g'), itm[prop]);
        }
        items.push(tmp);

    }

    output = output.replace(/\{TOTAL_COUNT\}/g, iTotal);
    output = output.replace(/\{ITEMS\}/g, items.join(''));
    output = output.replace(/\{REPORT_DATE\}/g, moment().tz("America/New_York").format('LLL'));

    return output;
}

function getOutputText(data) {
    return _getOutput(data, 'TEXT');
}

function checkForUpdates() {

    console.log('Checking to make sure background process is still running...');
    const now = new Date().getTime();

    if (now - storedLastUpdated > config.RESTART_THREASHOLD * 1000) {
        console.log('Background process stopped running.  Restarting...');

        //killing the process will force the cluster to start a new worker thread.
        process.exit();
    } else {
        console.log('Background process is still running.');

    }

}

async function main() {
    //refresh the data
    try {
        await setItemData();
    } catch (e) {
        console.error(e);
    }

    //sleep for a second before going after it
    setTimeout(main, 1000);

}

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/index.html', express.static(path.join(__dirname, 'public', 'index.html')))

app.get('/data', async (req, res) => {
    
    const refresh = config.REFRESH;
    const region = config.REGION;
    const base = config.BASE_SITE;
    const items = await getItemData();
    const version = pkg.version;

    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].count;
    }

    const output = {
        config: {
            version,
            refresh,
            base,
            region
        },
        data: {
            total,
            items
        }
    };

    res.set('Content-Type', 'application/json');
    res.set('Cache-Control', `max-age=0,s-maxage=${refresh}`);

    res.send(JSON.stringify(output, null, 1));
});

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});

//background thread to keep the data fresh
main();

//wait a minute before checking to see if the main thread broke
setInterval(checkForUpdates, 60000);