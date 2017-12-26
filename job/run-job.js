const {
    logUtil,
    prepareFolder
} = require('../common/util');
const {
    runPuppeteer
} = require('./puppeteer-runner');

let prepareEnv = async function (jobData) {
    let jobFolderPath = `./job-result/${jobData.id}/`;
    await prepareFolder(jobFolderPath + 'screenshot')
    return jobFolderPath;
}

let runJob = async function (jobData, io) {
    let jobFolderPath = await prepareEnv(jobData);
    let result;
    try {
        result = await runPuppeteer(jobData, jobFolderPath, io);
    } catch (err) {
        logUtil.error('run job error', err);
    }
    logUtil.log(result);
    return result;
}


module.exports = {
    runJob: runJob
}