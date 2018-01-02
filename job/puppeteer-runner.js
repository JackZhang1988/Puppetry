const fs = require('fs');
const vm = require('vm');
const puppeteer = require("puppeteer");
const {
    logUtil,
    prepareFolder
} = require('../common/util');

const {
    compare
} = require('./image-diff');

const {
    compareWorker
} = require('./job-worker');

// 时间戳20171129-081628
function getTimeStamp() {
    let dd = new Date();
    return dd.toJSON().replace(/[-|:]/g, '').replace('T', '-').slice(0, -5);
}

//存储不同job的browser实例
let jobBrowsers = {};
async function prepareBrowser(jobId) {
    if (jobBrowsers[jobId]) {
        return jobBrowsers[jobId];
    } else {
        browser = await puppeteer.launch({
            slowMo: 200,
            args: ['--no-sandbox']
        });
        page = await browser.newPage();

        jobBrowsers[jobId] = {
            browser: browser,
            page: page
        };
        return jobBrowsers[jobId];
    }
}

function stopBrowser(jobId) {
    if (jobId && jobBrowsers[jobId]) {
        jobBrowsers[jobId].browser.close();
        jobBrowsers[jobId] = null;
        return true;
    } else {
        return false;
    }
}

let runPuppeteer = async function (jobData, jobFolderPath, io) {
    let acList = jobData.actionList;
    let screenshotBasePath = jobFolderPath + 'screenshot';
    let timeStamp = getTimeStamp(); //job执行时间戳
    let lastScsFile, lastScsData; //记录上一个任务执行的快照文件地址，用于imageDiff
    let result = []; //job执行结果

    function logAction(logInfo, type = 'action') {
        logUtil.debug(logInfo)
        io.in(`job-room-${jobData._id}`).emit(`jobRunLog`, {
            type: type,
            data: logInfo
        });
        result.push({
            type: type,
            data: logInfo
        })
    }

    /**
     * 初始化actionList，判断是否是循环action
     * 默认第一个action判断是否为loop
     * @param {Array} actionList 
     */
    function preInitAcList(actionList) {
        let temp = [];
        if (actionList[0].name == 'loop') {
            let loopDataSource = JSON.parse(actionList[0].data.loopDataSource);
            for (let i = 0; i < loopDataSource.length; i++) {
                let data = loopDataSource[i];

                for (let j = 1; j < actionList.length; j++) {
                    let item = actionList[j];
                    let tplStr = JSON.stringify(item.data);
                    let tplFun = new Function('data', "return JSON.parse(`" + tplStr + "`);");
                    let _result = tplFun.call(null, data);
                    if (item.name == 'screendiff') {
                        //修改screendiff action referenceId index
                        let origIndex = item.data.referenceId.split('-')[1];
                        _result.referenceId = item.data.referenceId.split('-')[0] + '-' + (origIndex - 1 + (actionList.length - 1) * i)
                    }
                    temp.push({
                        name: item.name,
                        data: _result
                    });
                }
            }
        } else {
            temp = actionList;
        }
        return temp;
    }

    async function screenshotDOMElement(filePath, selector, padding = 0) {
        const rect = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            const {
                x,
                y,
                width,
                height
            } = element.getBoundingClientRect();
            return {
                left: x,
                top: y,
                width,
                height,
                id: element.id
            };
        }, selector);

        return await page.screenshot({
            path: filePath,
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }
    async function screenshotFullPage(filename) {
        await page.screenshot({
            path: filename,
            fullPage: true
        });
    }
    async function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    async function getPerformance() {
        const timing = await page.evaluate(() => {
            return window.performance.timing;
        });
    }

    async function runActionList(actionList, jobData) {
        for (let i = 0; i < actionList.length; i++) {
            let data = actionList[i].data;
            let name = actionList[i].name;
            let scsFile, scsType, refFile, logInfo;
            switch (name) {
                case 'gourl':
                    await page.goto(`${data.urlInput}`);
                    logInfo = `${data.urlInput}`;
                    logAction(logInfo, 'gourl')

                    break;
                case 'delay':
                    await timeout(data.delayTime);
                    logInfo = `${data.delayTime}`
                    logAction(logInfo, 'delay')
                    break;
                case 'screenshot':
                    scsFile = ''
                    scsType = data.screenshotType == 2 ? 'fullpage' : 'selecter';
                    if (data.isReference) {
                        // ref文件命名方式：
                        // ref-动作索引（用户一个job生成多个ref文件）-[fullpage|selecter].png
                        scsFile = `${screenshotBasePath}/ref-action${i}-${scsType}.png`;
                    } else {
                        scsFile = `${screenshotBasePath}/scs-action${i}-${scsType}-${timeStamp}.png`;
                        lastScsFile = scsFile;
                        lastScsData = data;
                    }
                    if (data.screenshotType == 2) {
                        await page.screenshot({
                            path: scsFile,
                            fullPage: true
                        });
                    } else {
                        await screenshotDOMElement(scsFile, data.selecterInput);
                    }
                    logInfo = `${scsFile}`;
                    logAction(logInfo, 'screenshot')
                    break;
                case 'screendiff':
                    // 找到ref快照，进行对比
                    // referenceId 如果有【-】分隔符，则referenceId.split('-')[1]表示引用图片的任务id
                    // 如果没有则从当前任务执行action 索引为index
                    // todo: 如果没有自动从referenceId对应的任务中取第一个
                    scsType = lastScsData.screenshotType == 2 ? 'fullpage' : 'selecter';
                    refFile = `./job-result/${data.referenceId.split('-')[0]}/screenshot/ref-action${data.referenceId.split('-').length>1?data.referenceId.split('-')[1]:i}-${scsType}.png`;
                    logInfo = `${lastScsFile},${refFile}`;
                    let diffImg = `${screenshotBasePath}/diff-action${i}-${scsType}-${timeStamp}.png`;
                    let diffResult;
                    try {
                        diffResult = await compareWorker(lastScsFile, refFile, diffImg);
                    } catch (error) {
                        console.error('screendiff error: ', error);
                        break;
                    }
                    logAction({
                        source: lastScsFile,
                        target: refFile,
                        diffImg: diffImg,
                        result: diffResult
                    }, 'screendiff');
                    break;
                case 'puppeteer-page':
                    let actionType = data.actionType;
                    let isStringParam = false;
                    let actionParams = data.actionParams.map(param => {
                        let result;
                        let isArrParam = param.startsWith('[') && param.endsWith(']');
                        let isObjParam = param.startsWith('{') && param.endsWith('}');
                        let isFuncParam = param.startsWith('function');
                        try {
                            if (isArrParam || isObjParam || isFuncParam) {
                                eval('result = ' + param);
                            } else {
                                isStringParam = true;
                                eval('result = "' + param.replace(/"/g, '\\"') + '"');
                            }
                        } catch (error) {
                            result = '';
                            logUtil.error('action param error');
                        }
                        return result;
                    });
                    logInfo = `await page.${actionType}(${isStringParam?'"':''}${data.actionParams.join(',')}${isStringParam?'"':''})`;
                    logAction(logInfo, 'puppeteer-page')
                    try {
                        await page[actionType](...actionParams);
                    } catch (error) {
                        logUtil.error('puppeteer-page action error', error);
                        return;
                    }
                    break;
                case 'cookie':
                    let cookieAdd = data.cookieAdd;
                    let cookie = data.cookie;
                    let __initCookieList = (cookies) => {
                        if (typeof cookies == "string") {
                            // document.cookie
                            return cookies.split(';').map(item => {
                                let value = item.split('=');
                                return {
                                    name: value[0].trim(),
                                    value: value[1].trim(),
                                    domain: data.domain || 'weidian.com',
                                    path: data.path || '/'
                                }
                            })
                        }
                    }
                    if (cookieAdd) {
                        await page.setCookie(...__initCookieList(data.cookie));
                    } else {
                        await page.deleteCookie(...__initCookieList(data.cookie));
                    }
                    logInfo = `${cookieAdd?'添加':'删除'}cookies：${cookie}`;
                    logAction(logInfo, 'cookie')
                    break;
                case 'code-script':
                    code = data.code;
                    code = code.replace('debugger', 'page.evaluate(() => { debugger; })');
                    code = `(async() => { ${code} })().catch((error) => { console.error('Puppeteer Runtime Error:', error.stack); });`;
                    const scope = {
                        page,
                        console: {
                            log: (...args) => page.evaluate((...args) => console.log(...args), ...args),
                            error: (...args) => page.evaluate((...args) => console.error(...args), ...args),
                            debug: (...args) => page.evaluate((...args) => console.debug(...args), ...args),
                        },
                    };
                    logAction(code, 'code-script')
                    try {
                        await vm.runInThisContext(code, scope);
                    } catch (error) {
                        logUtil.error(error);
                    }
                    break;
                case 'page-performance':
                    const timing = await page.evaluate(() => {
                        const result = {};
                        for (const key of Object.keys(window.performance.timing.__proto__)) {
                            result[key] = window.performance.timing[key];
                        }
                        if (window.firstScreenTime) {
                            result['firstScreenTime'] = window.firstScreenTime;
                        }
                        return result;
                    });
                    logAction(timing, 'page-performance');
                    break;
                default:
                    break;
            }
        }
    }

    await prepareBrowser(jobData._id);
    let {
        browser,
        page
    } = jobBrowsers[jobData._id];
    page.setViewport({
        width: jobData.config.width,
        height: jobData.config.height
    })
    if (jobData.config.checkPageError) {
        page.on('pageerror', error => {
            logAction(`页面报错 : ${error}`, 'pageerror');
        })
    }
    try {
        await runActionList(preInitAcList(acList), jobData);
    } catch (error) {
        logUtil.error('puppeteer run error: ', error);
    } finally {
        browser.close();
        //浏览器关闭制空该job下browser实例
        jobBrowsers[jobData._id] = null;
        return result;
    }
    // browser.close();
    //生成result.json文件
    // fs.writeFileSync(`${jobFolderPath}/result/result-${timeStamp}.json`, JSON.stringify(result));
}

module.exports = {
    runPuppeteer: runPuppeteer,
    prepareBrowser: prepareBrowser,
    stopBrowser: stopBrowser
}