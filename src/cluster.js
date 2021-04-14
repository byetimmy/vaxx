'use strict';
require('dotenv').config();

const cluster = require('cluster');
const os = require('os');
const pjson = require('../package.json');
const config = require('./config');


if (cluster.isMaster) {

  console.info('Server cluster master is active. Forking worker now...');

  let numCPUs = parseInt(config.CLUSTER_THREADS, 10);
  if (numCPUs === -1) {
    numCPUs = os.cpus().length;
    if (numCPUs > 1) {
      console.info('Found ' + numCPUs + ' cpus.  Spawning workers...');
      numCPUs--;
    }
  }

  for (let i = 0; i < numCPUs; i++) {
    //this is what runs in the worker threads
    console.info('Starting worker thread #' + (i + 1) + '...');
    cluster.fork();
  }

  console.info(pjson.name + ' started.');

  cluster.on('exit', function(worker) {
    console.error('Worker ' + worker.id + ' has stopped. Creating a new one...');
    cluster.fork();
  });

} else {

  require('./app.js');

}