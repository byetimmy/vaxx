'use strict';
require('dotenv').config();

const config = require('./config');
const utils = require('./utils');
const store = require('./store');
const express = require('express');
const path = require('path');
const app = express();
const port = config.PORT;
const pkg = require('../package.json');


async function getItemData() {
    const results = await store.getResults();
    return Promise.resolve(results);
}

async function setItemData() {

    const items = await utils.getVaxxItems();
    let results = items.data;

    const storedResults = await getItemData();

    //something errored on the site, just skip processing
    if (items.errors.length > 0) {
        return;
    }

    if (results.length === 0 && storedResults.length > 500) {
        return;
    }


    await store.setResults(results);

}

function checkForUpdates() {

    console.log('Checking to make sure background process is still running...');
    const now = new Date().getTime();

    if (now - store.getLastUpdated() > config.RESTART_THREASHOLD * 1000) {
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
    setTimeout(main, config.REFRESH * 1000);

}

// most urls should resolve to the public html
app.use('/', express.static(path.join(__dirname, 'public')));

// if they want data, give them data!
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