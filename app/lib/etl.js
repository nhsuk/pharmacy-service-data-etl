const moment = require('moment');
const requireEnv = require('require-environment-variables');

const EtlStore = require('etl-toolkit').EtlStore;
const config = require('./config');
const getAllIDs = require('./getAllIDs');
const getService = require('./actions/getService');
const PopulateRecordsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const log = require('./logger');

requireEnv(['ETL_NAME']);
requireEnv(['OUTPUT_FILE']);

const WORKERS = 1;
let resolvePromise;
let dataService;
let startMoment;
const etlStore = new EtlStore({ idKey: config.idKey, log, outputFile: config.outputFile });

const populateRecordsFromIdsQueue = new PopulateRecordsQueue({
  etlStore,
  hitsPerHour: config.hitsPerHour,
  log,
  populateRecordAction: getService,
});

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${etlStore.getErroredIds().length} errored records`);
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  logStatus();
  if (etlStore.getRecords().length > 0) {
    await dataService.uploadData(startMoment);
    await dataService.uploadSummary(startMoment);
  }
  if (resolvePromise) {
    resolvePromise();
  }
}

function startRevisitFailuresQueue() {
  if (etlStore.getErroredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
      queueComplete: etlComplete,
      workers: WORKERS,
    };
    populateRecordsFromIdsQueue.startRetryQueue(options);
  } else {
    etlComplete();
  }
}

function startPopulateRecordsFromIdsQueue() {
  const options = {
    queueComplete: startRevisitFailuresQueue,
    workers: WORKERS,
  };
  populateRecordsFromIdsQueue.start(options);
}

async function etl(dataServiceIn) {
  dataService = dataServiceIn;
  startMoment = moment();
  clearState();
  const pageIds = await getAllIDs();
  log.info(`Total ids: ${pageIds.length}`);
  etlStore.addIds(pageIds);
  startPopulateRecordsFromIdsQueue();
}

function start(dataServiceIn) {
  return new Promise((resolve, reject) => {
    etl(dataServiceIn).catch((ex) => {
      log.error(ex);
      reject(ex);
    });

    resolvePromise = () => {
      resolve();
    };
  });
}

module.exports = {
  etlStore,
  start,
};
