var cp = require('child_process');

async function compareWorker(source, target, diffImgPath) {
    return new Promise((resolve, reject) => {
        let worker = cp.fork(require.resolve('./image-diff.js'));
        worker.send({
            source: source,
            target: target,
            diffImgPath: diffImgPath
        });
        worker.on('message', function (data) {
            worker.kill();
            resolve(data);
        });
        worker.on('error', err => {
            console.error('work error:', err);
            worker.kill();
            reject(err);
        })

        worker.on('exit', function (code, signal) {
            console.log('worker exit:', code, signal);
            worker.kill();
            reject('work exits');
        });
    })
}

module.exports = {
    compareWorker: compareWorker
};