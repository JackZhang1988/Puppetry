const mongoose = require('mongoose');
const config = require('./config');
mongoose.connect(`mongodb://${config.DBURL}`, {
    useMongoClient: true
});

// Use native promises
mongoose.Promise = global.Promise;

let JobSchema = mongoose.model('Job', new mongoose.Schema({
    jobTitle: String,
    jobDesc: String,
    config: mongoose.Schema.Types.Mixed,
    actionList: {
        type: Array,
        required: true
    }
}))
let JobResultSchema = mongoose.model('JobResult', new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    resultStatus: String, // 表示任务运行状态， running, fail, success, cancel 等
    actionList: Array,
    result: Array,
    date: {
        type: Date,
        default: Date.now
    }
}))

module.exports = {
    Job: JobSchema,
    JobResult: JobResultSchema
}