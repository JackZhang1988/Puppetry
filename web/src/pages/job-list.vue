<template>

    <div class="start-wrap">
        <div style="margin: 15px 0;">
            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="goLink('job-add')">创建任务</el-button>
        </div>
        <div class="job-card" v-for="(item, index) in jobList" @click="goJobDetail(item)">
            <el-card>
                <div class="img-wrap">
                    <img class="job-card-image" :src="'https://github.com/identicons/'+index+'.png'" alt="">
                </div>
                <div class="job-card-header">{{item.jobTitle}}</div>
            </el-card>
        </div>
    </div>

</template>

<script>
    export default {
        data() {
            return {
                urlType: null,
                urlInput: '',
                errorResult: [],
                jobList: [],
                schemaHtml: ''
            }
        },
        created() {
            this.getAllAutoTestjob();
        },
        methods: {
            goLink(routerPath) {
                this.$router.push('/' + routerPath);
            },
            goJobDetail(item) {
                this.$router.push(`/job-detail/${item._id}`)
            },
            getAllAutoTestjob() {
                this.$http.get(SERVER_BASE + '/jobs').then(res => {
                    if (res.status == 200 && res.data.status == 0) {
                        this.jobList = res.data.result;
                    }
                })
            }
        }
    }
</script>

<style>
    .input-with-select .el-input-group__prepend {
        min-width: 130px;
    }

    .job-card {
        max-width: 200px;
        float: left;
        margin-right: 15px;
        margin-bottom: 15px;
    }

    .job-card:hover {
        cursor: pointer;
    }

    .job-card-header {
        font-size: 16px;
        margin-top: 10px;
        color: black;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        text-align: center;
        min-height: 47px;
    }

    .job-card-content {
        font-size: 14px;
        color: #999;
    }

    .img-wrap {
        width: 158px;
        height: 158px;
        background-color: #f0f0f0;
    }

    .job-card-image {
        width: 100%;
        display: block;
    }
</style>