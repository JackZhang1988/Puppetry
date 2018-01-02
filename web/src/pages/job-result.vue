<template>
    <div class="job-result">
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/job-list' }">任务列表</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/job-detail/'+jobId }">任务详情</el-breadcrumb-item>
            <el-breadcrumb-item>任务结果</el-breadcrumb-item>
        </el-breadcrumb>
        <el-collapse v-if="jobHistory.actionList" class="job-action-collapse">
            <el-collapse-item name="jobActionList">
                <template slot="title">
                    <div class="collapse-title">
                        构建参数
                        <i class="header-icon el-icon-info"></i>
                    </div>
                </template>
                <el-table :data="jobHistory.actionList" style="width: 100%">
                    <el-table-column prop="name" label="类型" width="180">
                    </el-table-column>
                    <el-table-column prop="data" label="参数">
                        <template slot-scope="scope">
                            <div>{{scope.row.data}}</div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-collapse-item>
        </el-collapse>
        <el-table :data="jobResult" style="width: 100%" v-loading="loading">
            <el-table-column label="步骤" width="80">
                <template slot-scope="scope">
                    <div @click="test(scope)">{{scope.$index+1}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="180">
            </el-table-column>
            <el-table-column label="结果预览">
                <template slot-scope="scope">
                    <div class="result-ctn">
                        <a class="link" v-if="scope.row.type == 'gourl'" :href="scope.row.data">{{scope.row.data}}</a>
                        <span v-else-if="scope.row.type == 'delay'">延迟{{scope.row.data}}毫秒</span>
                        <p v-else-if="scope.row.type == 'pageerror'" class="pageerror-result">
                            {{scope.row.data}}
                        </p>
                        <el-collapse v-else-if="scope.row.type == 'screenshot'">
                            <el-collapse-item name="1">
                                <template slot="title">
                                    <i class="header-icon el-icon-info"></i>
                                    <el-button type="text" class="title-btn">
                                        查看快照图片
                                    </el-button>
                                </template>
                                <img :src="scope.row.data|getImgLink" class="screen-img">
                            </el-collapse-item>
                        </el-collapse>
                        <el-collapse v-else-if="scope.row.type == 'screendiff'">
                            <div class="diff-data">
                                <h3>diff 数据:</h3>
                                <p class="diff-item">
                                    图片纬度是否一致：{{scope.row.data.result.isSameDimensions}}
                                </p>
                                <p class="diff-item" v-if="!scope.row.data.result.isSameDimensions">
                                    纬度差异：{{scope.row.data.result.dimensionDifference}}
                                </p>
                                <p class="diff-item" :class="{warning: scope.row.data.result.misMatchPercentage > 10}">
                                    图片不一致百分比：{{scope.row.data.result.misMatchPercentage}}
                                </p>
                                <p class="diff-item">
                                    计算时间：{{scope.row.data.result.analysisTime}}ms
                                </p>
                            </div>
                            <el-collapse-item name="1">
                                <template slot="title">
                                    <i class="header-icon el-icon-info"></i>

                                    <el-button type="text" class="title-btn">
                                        查看图片对比结果
                                    </el-button>
                                </template>
                                <div class="result-json">
                                    <table class="result-table">
                                        <tr>
                                            <th>测试图片</th>
                                            <th>对比图片</th>
                                            <th>Diff 结果</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <img :src="scope.row.data.source | getImgLink" alt="">
                                            </td>
                                            <td>
                                                <img :src="scope.row.data.target | getImgLink" alt="">
                                            </td>
                                            <td>
                                                <img :src="scope.row.data.diffImg | getImgLink" alt="">
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                        <p v-else-if="scope.row.type == 'page-performance'">
                            <table class="perf-table">
                                <tr>
                                    <td>白屏时间</td>
                                    <td>{{scope.row.data | getPerformanceData('whiteScreen')}}</td>
                                </tr>
                                <tr>
                                    <td>首屏时间</td>
                                    <td>{{scope.row.data | getPerformanceData('firstScreen')}}</td>
                                </tr>
                                <tr>
                                    <td>用户可交互时间</td>
                                    <td>{{scope.row.data | getPerformanceData('domReady')}}</td>
                                </tr>
                                <tr>
                                    <td>总下载时间</td>
                                    <td>{{scope.row.data | getPerformanceData('onLoad')}}</td>
                                </tr>
                                <tr>
                                    <td>HTML下载时间</td>
                                    <td>{{scope.row.data | getPerformanceData('dns')}}</td>
                                </tr>
                                <tr>
                                    <td>TCP连接时间</td>
                                    <td>{{scope.row.data | getPerformanceData('tcp')}}</td>
                                </tr>
                                <tr>
                                    <td>HTTP请求时间</td>
                                    <td>{{scope.row.data | getPerformanceData('httpRequest')}}</td>
                                </tr>
                                <tr>
                                    <td>HTTP响应时间</td>
                                    <td>{{scope.row.data | getPerformanceData('httpRespond')}}</td>
                                </tr>
                            </table>
                        </p>
                        <p v-else>
                            {{scope.row.data}}
                        </p>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
    import Vue from 'vue';
    Vue.filter('getImgLink', function (value) {
        if (!value) return ''
        value = value.toString().slice(1);
        return SERVER_BASE + value;
    })
    Vue.filter('getPerformanceData', function (timing, type) {
        switch (type) {
            case 'whiteScreen':
                return timing.responseEnd - timing.fetchStart + '毫秒';
                break;
            case 'firstScreen':
                return timing.firstScreenTime ? (timing.firstScreenTime - timing.fetchStart + '毫秒') :
                    '未找到firstScreenTime变量';
            case 'domReady':
                return timing.redirectEnd - timing.redirectStart + '毫秒';
            case 'onLoad':
                return timing.responseEnd - timing.requestStart + '毫秒';
            case 'dns':
                return timing.domainLookupEnd - timing.domainLookupStart + '毫秒';
            case 'tcp':
                return timing.connectEnd - timing.connectStart + '毫秒';
            case 'httpRequest':
                return timing.responseEnd - timing.requestStart + '毫秒';
            case 'httpRespond':
                return timing.responseStart - timing.navigationStart + '毫秒';
            default:
                return ''
        }
    })
    export default {
        data() {
            return {
                jobId: null,
                jobHistory: {},
                jobResult: [],
                loading: true
            }
        },
        created() {
            this.getJobHistory();
        },
        checkFile(path) {

        },
        methods: {
            getJobHistory() {
                this.$http.get(SERVER_BASE + '/jobResult?id=' + this.$route.params.id).then(res => {
                    this.loading = false;
                    if (res.status == 200 && res.data.status == 0) {
                        this.jobHistory = res.data.result;
                        this.jobResult = res.data.result.result;
                        this.jobId = res.data.result.jobId;
                    }
                })
            },
        }
    }
</script>
<style>
    .link {
        color: #409EFF
    }

    .title-btn {
        /* margin-left: 10px; */
    }

    .pageerror-result {
        color: red;
    }

    .result-table {
        overflow: scroll;
        display: block;
    }

    .result-table td {
        padding: 0 !important;
        margin: 0;
        vertical-align: top;
    }

    .result-table th {
        font-size: 18px;
        font-weight: bold;
        background-color: aliceblue;
        text-align: center;
    }

    .warning {
        color: red;
    }

    .job-action-collapse {
        margin-bottom: 15px;
    }

    .collapse-title {
        padding-left: 15px;
        font-weight: bold;
        color: #2196F3;
    }

    .perf-table {
        width: 100%;
    }

    .perf-table tr {}
</style>