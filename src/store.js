'use strict';
let storedResults = [];
let storedLastUpdated = new Date().getTime();
 
async function getResults() {
    return Promise.resolve(storedResults);
}

async function setResults(results) {
    storedResults = results;
    storedLastUpdated = new Date().getTime();
    return Promise.resolve(true);
}

function getLastUpdated() {
    return storedLastUpdated;
}

module.exports = {
    getResults,
    setResults,
    getLastUpdated
}