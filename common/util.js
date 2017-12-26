let Promise = require("bluebird");
const mkdirp = require('mkdirp');
const chalk = require('chalk');

const logUtil = {
    log(content, ...args) {
        console.log(chalk.cyan('log ==> '), chalk.yellow(typeof content == 'object' ? JSON.stringify(content) : content), ...args);
    },
    debug(content, ...args) {
        console.log(chalk.cyan('debug ==> '), chalk.yellow(typeof content == 'object' ? JSON.stringify(content) : content), ...args);
    },
    error(content, ...args) {
        console.log(chalk.red('error ==> '), chalk.red(typeof content == 'object' ? JSON.stringify(content) : content), ...args)
    }
}

// validFromFile('./sellerid.csv')
let prepareFolder = async function (folderPath) {
    return new Promise((resolve, reject) => {
        logUtil.debug('prepare folder:' + folderPath);
        mkdirp(folderPath, (err) => {
            if (err) reject(err)
            else resolve(folderPath)
        })
    })
}
module.exports = {
    logUtil: logUtil,
    prepareFolder: prepareFolder
}