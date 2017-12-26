<template>

    <div class="start-wrap">
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/job-list' }">任务列表</el-breadcrumb-item>
            <el-breadcrumb-item>任务详情</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="job-actions">
            <el-button type="primary" :loading="jobRunning" @click="runJob()">运行任务</el-button>
            <el-button type="success" @click="editJob()">编辑任务</el-button>
            <el-button type="danger" @click="delJob()">删除任务</el-button>
            <el-button type="danger" @click="stopJob()" v-if="jobRunning">终止任务</el-button>
        </div>
        <el-tabs v-model="activeName" type="border-card">
            <el-tab-pane label="任务详情" name="detail">
                <el-input class="action-item" disabled v-model="jobData.jobTitle" placeholder="填写测试用例标题"></el-input>
                <el-input class="action-item" disabled v-model="jobData.jobDesc" type="textarea" :rows="6" placeholder="填写测试用例描述"></el-input>
                <div class="action-list">
                    <component v-for="(child, index) in jobData.actionList" :is="child.name" :key="child.__ob__.dep.id" :index="index" :defaultData="child.data">
                    </component>
                </div>
            </el-tab-pane>
            <el-tab-pane label="实时预览" name="chromeAction" v-loading="chromeLoading" element-loading-text="正在初始化浏览器实例">
                <iframe width="100%" class="chrome-iframe" :src="targetUrl"></iframe>
            </el-tab-pane>
            <el-tab-pane label="日志" name="log">
                <div class="log-ctn">
                    <div v-for="(log, index) in jobLogs" :key="index" class="log-item">
                        <span class="log-type">{{ log.type }}</span>
                        <span class="log-data">{{ log.data }}</span>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="任务配置" name="config">
                <el-form :model="config" class="config-form">
                    <el-form-item label="运行配置">
                        <el-checkbox v-model="config.isRunChromeAction">开启chrome实时预览</el-checkbox>
                        <el-switch v-if="config.isRunChromeAction" class="switch-action" active-color="#13ce66" inactive-color="#2196F3" v-model="config.isOpenNewWindow"
                            active-text="新窗口打开chrome实例" inactive-text="内嵌iframe">
                        </el-switch>
                    </el-form-item>
                    <el-form-item label="视图大小">
                        <el-col :span="4">
                            <el-input type="text" placeholder="视图宽度" v-model="config.width">
                                <template slot="append">px</template>
                            </el-input>
                        </el-col>
                        <el-col :span="4" style="margin-left:5px;">
                            <el-input type="text" placeholder="视图高度" v-model="config.height">
                                <template slot="append">px</template>
                            </el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="页面检测配置">
                        <el-checkbox v-model="config.checkPageError">是否检测pageerror</el-checkbox>
                        <el-checkbox v-model="config.checkPageSpeed">是否检测pagespeed</el-checkbox>
                    </el-form-item>
                    <el-form-item label="diff missmatch阈值">
                        <el-col :span="4">
                            <el-input v-model="config.missmatch">
                                <template slot="append">%</template>
                            </el-input>
                        </el-col>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="saveConfig()">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="构建历史" name="history">
                <el-table :data="jobHistory" style="width: 100%">
                    <el-table-column label="构建日期" width="200">
                        <template slot-scope="scope">
                            <span>{{scope.row.date|dateFormate}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="构建结果">
                        <template slot-scope="scope">
                            <el-button type="text" @click="goJobResult(scope)">查看构建结果</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>

</template>

<script>
    import Vue from 'vue';
    Vue.filter('dateFormate', function (dateStr) {
        let dd = new Date(dateStr);
        return dd.toLocaleString();
    })

    export default {
        data() {
            return {
                jobData: {},
                jobRunning: false,
                activeName: 'detail',
                jobHistory: [],
                jobLogs: [],
                chromeLoading: false,
                targetUrl: '',
                config: {
                    isRunChromeAction: true,
                    isOpenNewWindow: false,
                    width: 414,
                    height: 736,
                    checkPageError: true,
                    checkPageSpeed: false
                },
            }
        },
        created() {
            this.getJobData();
            this.getJobHistory();
        },
        sockets: {
            connect: function () {
                console.log('socket connected')
                this.$socket.emit('join-job-room', this.$route.params.id);
            },
            jobRunLog: function (val) {
                console.log(val);
                this.jobLogs.push(val);
            }
        },
        methods: {
            getJobData() {
                this.$http.get('/api/jobDetail?jobId=' + this.$route.params.id).then(res => {
                    if (res.status == 200 && res.data.status == 0) {
                        this.jobData = res.data.result;
                        this.config = Object.assign(this.config, res.data.result.config);
                    }
                })
            },
            getJobHistory() {
                this.$http.get('/api/jobHistory?jobId=' + this.$route.params.id).then(res => {
                    if (res.status == 200 && res.data.status == 0) {
                        this.jobHistory = res.data.result;
                    }
                })
            },
            goJobResult(scope) {
                this.$router.push('/job-result/' + scope.row._id);
            },
            saveConfig() {
                this.$http.post('/api/saveConfig', {
                    jobId: this.$route.params.id,
                    config: this.config
                }).then(res => {
                    this.jobRunning = false;
                    if (res.status == 200 && res.data.status == 0) {
                        this.$message({
                            type: 'success',
                            message: '保存成功'
                        })
                    } else {
                        this.$message({
                            message: '保存失败',
                            type: 'error'
                        })
                    }
                })
            },
            stopJob() {
                this.$http.post('/api/stopChromeTarget', {
                    jobId: this.$route.params.id
                }).then(res => {
                    this.jobRunning = false;
                    if (res.status == 200 && res.data.status == 0) {
                        this.$message({
                            type: 'warnning',
                            message: 'job已终止'
                        })
                    } else {
                        this.$message({
                            message: 'job终止失败',
                            type: 'error'
                        })
                    }
                })
            },
            editJob() {
                this.$router.push('/job-edit/' + this.$route.params.id);
            },
            delJob() {
                this.$confirm('此操作将永久删除任务, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post('/api/delJob', {
                        jobId: this.$route.params.id
                    }).then(res => {
                        if (res.status == 200 && res.data.status == 0) {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            }).then(() => {
                                this.$router.replace('/job-list');
                            });
                        }
                    })
                }).catch(() => {});
            },
            runJob() {
                this.jobRunning = true;
                if (this.config.isRunChromeAction) {
                    this.activeName = 'chromeAction';
                } else {
                    this.activeName = 'log';
                }
                this.jobLogs.push({
                    type: 'job开始执行'
                })

                function __runJob() {
                    this.$http.post('/api/runJob', {
                        jobId: this.$route.params.id,
                        actionList: this.jobData.actionList
                    }).then(res => {
                        this.jobRunning = false;
                        if (res.status == 200 && res.data.status == 0) {
                            this.$confirm('构建成功,点击确定查看任务执行结果', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'success'
                            }).then(() => {
                                this.$router.push('/job-result/' + res.data.result._id);
                            }).catch();
                        } else {
                            this.$message({
                                message: res.data.result,
                                type: 'error'
                            })
                        }
                    }).catch(err => {
                        this.$message({
                            message: '任务构建出错',
                            type: 'error'
                        })
                        this.jobRunning = false;
                    })
                }
                if (this.config.isRunChromeAction) {
                    this.chromeLoading = true;
                    this.$http.get('/api/chromeTarget?jobId=' + this.$route.params.id).then(res => {
                        if (res.status == 200 && res.data.status == 0) {
                            let {
                                targetId
                            } = res.data.result;
                            let targetUrl =
                                `https://chrome-devtools-frontend.appspot.com/serve_file/@7f3cdc3f76faecc6425814688e3b2b71bf1630a4/inspector.html?ws=${DOMAIN}/${targetId}&remoteFrontend=true`;
                            if (this.config.isOpenNewWindow) {
                                window.open(targetUrl);
                            } else {
                                this.targetUrl = targetUrl;
                            }
                            // window.open(targetUrl);
                            this.chromeLoading = false;
                            __runJob.call(this);
                        }
                    })
                } else {
                    __runJob.call(this);
                }
            }
        }
    }
</script>

<style>
    .action-type-add {
        margin: 10px 0;
    }

    .action-item {
        margin-top: 10px;
    }

    .action-list {
        margin-bottom: 10px;
    }

    .comp-btns {
        float: right;
        position: relative;
        top: -8px;
    }

    .job-actions {
        margin: 10px 0;
    }

    .log-item {
        margin-bottom: 10px;
    }

    .log-ctn {
        background-color: #363636;
        color: #fff;
        padding: 10px;
    }

    .log-type {
        color: #f4f424;
    }

    .el-form-item__content {
        padding-left: 200px;
    }

    .chrome-iframe {
        height: 86vh;
    }

    .switch-action {
        display: block;
    }

    .config-form .el-form-item {
        padding: 15px 0px;
        margin-bottom: 0;
    }
</style>