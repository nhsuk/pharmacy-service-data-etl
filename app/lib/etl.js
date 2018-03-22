const moment = require('moment');
const requireEnv = require('require-environment-variables');

const etlStore = require('etl-toolkit').etlStore;
const getAllIDs = require('./getAllIDs');
const getService = require('./actions/getService');
const populateRecordsFromIdsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const log = require('./logger');

requireEnv(['ETL_NAME']);
requireEnv(['OUTPUT_FILE']);

const RECORD_KEY = 'odsCode';
const WORKERS = 1;
let resolvePromise;
let dataService;
let startMoment;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${etlStore.getErorredIds().length} errored records`);
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
  if (etlStore.getErorredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
      populateRecordAction: getService,
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
    populateRecordAction: getService,
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
  start,
};
