let fs = require('fs');
let resemble = require('node-resemble-js');
const {
    logUtil
} = require('../common/util');

process.on('message', __compareWorker);

// process.on('uncaughtException', (err) => {
// });
// resemble.outputSettings({
//     errorColor: {
//         red: 155,
//         green: 100,
//         blue: 155
//     },
//     errorType: 'movement'
// });
//     {
//       misMatchPercentage : 100, // %
//       isSameDimensions: true, // or false
//       dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
//       getImageDataUrl: function(){}
//     }

async function compare(source, target, diffImgPath) {
    return new Promise((resovle, reject) => {
        try {
            logUtil.debug('start compare: ', source, target);
            if (fs.existsSync(source) && fs.existsSync(target)) {
                resemble(source).compareTo(target).onComplete(function (data) {
                    // logUtil.debug(data);
                    // 小于0.1%的不生成diff
                    if (diffImgPath && data.misMatchPercentage >= 0.1) {
                        // logUtil.debug('data.misMatchPercentage:', data.misMatchPercentage)
                        // logUtil.debug('misMath source:', source)
                        let r = data.getDiffImage().pack().pipe(fs.createWriteStream(diffImgPath));
                        r.on('close', function () {
                            resovle(data);
                        });
                    } else {
                        resovle(data);
                    }
                });
            } else {
                throw 'source or target file not exists';
            }
        } catch (error) {
            logUtil.error('compare func err: ', error);
            reject(error);
        }
    })
}

function __compareWorker(data) {
    compare(data.source, data.target, data.diffImgPath).then(data => {
        sendMessage(data);
    }).catch(err => {
        process.exit(1);
    })
}

function sendMessage(data) {
    process.send(data);
}


module.exports = {
    compare: compare,
}