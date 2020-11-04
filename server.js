const Koa = require('koa');
const http = require('http');
const Router = require('koa-router');
const cors = require('@koa/cors');
const json = require('koa-json')
const bodyParser = require('koa-bodyparser');
const StaticServer = require('koa-static-server');
const socket = require('socket.io')
const url = require('url');
const httpProxy = require('http-proxy');
global.Promise = require('bluebird');

const DBSchema = require('./common/db-schema');
const {
    logUtil
} = require('./common/util');
const {
    runJob
} = require('./job/run-job');
const {
    prepareBrowser,
    stopBrowser
} = require('./job/puppeteer-runner');

const app = new Koa();
const router = new Router();

const server = http.createServer(app.callback())
const io = socket(server)

let proxy = httpProxy.createProxyServer();

let jobRoom = {};

let mainBrowser;

io.on('connection', function (socket) {
    logUtil.debug('a user connected')
    socket.on('join-job-room', jobId => {
        logUtil.debug(`socket join job-room-${jobId}`);
        socket.join(`job-room-${jobId}`);
    })
})

app.use(cors({
    credentials: true
}));
app.use(json());
app.use(bodyParser());
app.use(StaticServer({
    rootDir: './job-result',
    rootPath: '/api/job-result'
}))

app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        logUtil.error('koa error', err);
        ctx.status = err.status || 500;
        ctx.body = err.message;
        ctx.app.emit('error', err, ctx);
    }
})

//防止 ECONNRESET error
const asyncMiddleware = (handler) => {
    return (req, socket, head) => {
        Promise.resolve(handler(req, socket, head))
            .catch((error) => {
                logUtil.error('socket upgrade error', error);
                socket.end();
            });
    }
}

// app.use(async(ctx, next) => {
//     // the parsed body will store in ctx.request.body
//     // if nothing was parsed, body will be an empty object {}
//     ctx.body = ctx.request.body;
//     await next();
// });
let jobStatus = {};

let apiRouter = new Router();

apiRouter
    .get('/jobs', async(ctx, next) => {
        let result = await DBSchema.Job.find({});
        ctx.body = {
            status: 0,
            result: result
        }
    })
    .get('/jobDetail', async(ctx, next) => {
        let jobId = ctx.request.query.jobId;
        let result = await DBSchema.Job.findOne({
            _id: jobId
        })
        ctx.body = {
            status: 0,
            result: result
        }
    })
    .get('/jobHistory', async(ctx, next) => {
        let jobId = ctx.request.query.jobId;
        let result = await DBSchema.JobResult.find({
            jobId: jobId
        }).sort('-date');
        ctx.body = {
            status: 0,
            result: result
        }
    })
    .get('/jobResult', async(ctx, next) => {
        let id = ctx.request.query.id;
        let result = await DBSchema.JobResult.findOne({
            _id: id
        })
        ctx.body = {
            status: 0,
            result: result
        }
    })
    .post('/delJob', async(ctx, next) => {
        let id = ctx.request.body.jobId;
        if (id) {
            let result = await DBSchema.Job.remove({
                _id: id
            })
            ctx.body = {
                status: 0,
                result: result
            }
        }
    })
    .post('/saveJob', async(ctx, next) => {
        let actionList = ctx.request.body.actionList;
        let jobTitle = ctx.request.body.jobTitle;
        let jobDesc = ctx.request.body.jobDesc;
        let jobId = ctx.request.body.jobId;
        if (actionList) {
            let result;
            if (jobId) {
                //更新操作
                result = await DBSchema.Job.findByIdAndUpdate({
                    _id: jobId
                }, {
                    actionList: actionList,
                    jobTitle: jobTitle,
                    jobDesc: jobDesc
                })
            } else {
                let newData = new DBSchema.Job({
                    actionList: actionList,
                    jobTitle: jobTitle,
                    jobDesc: jobDesc
                })
                result = await newData.save();
            }
            ctx.body = {
                status: 0,
                result: result
            }
        }
    })
    .post('/stopChromeTarget', async(ctx, next) => {
        let jobId = ctx.request.body.jobId;
        if (stopBrowser(jobId)) {
            ctx.body = {
                status: 0,
                result: {}
            }
        } else {
            ctx.body = {
                status: 1,
                err: {}
            }
        }
    })
    .get('/chromeTarget', async(ctx, next) => {
        let jobId = ctx.request.query.jobId;
        let {
            browser,
            page
        } = await prepareBrowser(jobId);
        mainBrowser = browser;
        // const browserWSEndpoint = browser.wsEndpoint();
        const targetId = `devtools/page/${page._client._targetId}`;
        ctx.body = {
            status: 0,
            result: {
                targetId
            }
        }
    })

    .post('/runJob', async(ctx, next) => {
        let jobId = ctx.request.body.jobId;
        let actionList = ctx.request.body.actionList;
        let resultStatus, result = [],
            resResult;
        // let emit = io.in(`job-room-${jobId}`).emit

        if (typeof jobStatus[jobId] == 'undefined' || !jobStatus[jobId].isRunning) {
            jobStatus[jobId] = {
                isRunning: true
            }
            if (jobId) {
                let jobData = await DBSchema.Job.findOne({
                    _id: jobId
                })
                if (actionList) {
                    jobData.actionList = actionList;
                } else {
                    actionList = jobData.actionList;
                }
                let defaultConfig = {
                    "checkPageError": true,
                    "height": 736,
                    "width": 414,
                    "isOpenNewWindow": false,
                    "isRunChromeAction": true,
                    "checkPageSpeed": false,
                }
                jobData.config = Object.assign(defaultConfig, jobData.config);
                try {
                    result = await runJob(jobData, io);
                    jobStatus[jobId].isRunning = false;
                    resultStatus = 'success';
                } catch (error) {
                    jobStatus[jobId].isRunning = false;
                    logUtil.error('runjob api error', error);
                    resultStatus = 'fail';
                    result = [error];
                } finally {
                    let resultDB = new DBSchema.JobResult({
                        jobId: jobId,
                        actionList: actionList,
                        resultStatus: resultStatus,
                        result: result
                    })
                    let dbResult = await resultDB.save();
                    ctx.body = {
                        status: resultStatus == 'success' ? 0 : 1,
                        result: resultDB
                    }
                }
            }
        } else {
            ctx.body = {
                status: 2,
                result: '该任务正在运行，请等待运行完成后再执行'
            }
        }
    })

    .post('/saveConfig', async(ctx, next) => {
        let jobId = ctx.request.body.jobId;
        let config = ctx.request.body.config;
        if (jobId && config) {
            let result = await DBSchema.Job.findByIdAndUpdate({
                _id: jobId
            }, {
                config: config
            })
            ctx.body = {
                status: 0,
                result: result
            }
        } else {
            ctx.body = {
                status: 1,
                err: '缺少参数'
            }
        }
    })

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods());

app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(StaticServer({
        rootDir: './web/dist',
        rootPath: '/'
    }))
app.listen(3000)
server.on('upgrade', asyncMiddleware(async(req, socket, head) => {
    if (mainBrowser) {
        logUtil.log('http upgrade', req.url, mainBrowser.wsEndpoint());
        const port = url.parse(mainBrowser.wsEndpoint()).port;
        proxy.ws(req, socket, head, {
            target: `ws://127.0.0.1:${port}`
        })
    }
}))
proxy.on('error', (err, req, res) => {
    // logUtil.error(err);
    return;
})
process.on('exit', (code) => {
    mainBrowser && mainBrowser.close();
    console.log(`server exit`);
});