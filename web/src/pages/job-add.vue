<template>

    <div class="start-wrap">
        <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/job-list' }">任务列表</el-breadcrumb-item>
            <el-breadcrumb-item v-if="curBreadcrumbItemName=='编辑任务'" :to="{ path: '/job-detail/'+ $route.params.id}">任务详情</el-breadcrumb-item>
            <el-breadcrumb-item>{{curBreadcrumbItemName}}</el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <el-input class="action-item" v-model="jobTitle" placeholder="填写测试用例标题"></el-input>
            <el-input class="action-item" v-model="jobDesc" type="textarea" :rows="6" placeholder="填写测试用例描述"></el-input>
            <div class="action-item-ctn">
                <component v-for="(child, index) in actionList" :is="child.name" :key="child.__ob__.dep.id" :index="index" :defaultData="child.data"
                    @init="getData">
                    <div slot="action" class="comp-btns" slot-scope="props">
                        <el-button type="text" v-if="index!=0" @click="actionMoveupHandler(index,props.data)">上移</el-button>
                        <el-button type="text" @click="actionDelHandler(index,props.data)">删除</el-button>
                    </div>
                </component>
            </div>
            <el-select v-model="actionType" slot="prepend" placeholder="添加动作" class="action-type-add" @change="actionTypeChange">
                <el-option label="访问URL" value="gourl"></el-option>
                <el-option label="延迟" value="delay"></el-option>
                <el-option label="屏幕快照" value="screenshot"></el-option>
                <el-option label="快照对比" value="screendiff"></el-option>
                <el-option label="设置&删除Cookie" value="cookie"></el-option>
                <el-option label="Puppteer Page操作" value="puppeteer-page"></el-option>
                <el-option label="循环action" value="loop"></el-option>
                <el-option label="js code" value="code-script"></el-option>
            </el-select>
        </div>

        <el-button type="primary" @click="saveActions()" :disabled="disableSave">保存</el-button>
    </div>

</template>

<script>
    Array.prototype.move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    }
    export default {
        data() {
            return {
                actionType: null,
                jobTitle: '',
                jobDesc: '',
                actionList: [],
                disableSave: false,
                curBreadcrumbItemName: '创建任务'
            }
        },
        created() {
            if (this.$route.params.id) {
                this.getJobData();
                this.curBreadcrumbItemName = '编辑任务'
            }
        },
        methods: {
            getData(obj) {
                this.actionList[obj.index].data = obj.data;
                this.checkActionData();
            },
            getJobData() {
                this.$http.get('/api/jobDetail?jobId=' + this.$route.params.id).then(res => {
                    if (res.status == 200 && res.data.status == 0) {
                        let result = res.data.result;
                        this.jobTitle = result.jobTitle;
                        this.jobDesc = result.jobDesc;
                        this.actionList = result.actionList;
                    }
                })
            },
            checkActionData() {
                // let disableSave = false;

                // for(let i=0;i<this.actionList.length;i++){                    
                //     if (!this.actionList[i].data) {
                //         disableSave = true;
                //         break;
                //     }
                // }
                // this.disableSave = disableSave;
            },
            actionTypeChange() {
                this.actionList.push({
                    name: this.actionType,
                    data: null
                });
                this.actionType = null;
                this.checkActionData();
            },
            actionMoveupHandler(index, data) {
                this.actionList.move(index, index - 1);
                this.checkActionData()
            },
            actionDelHandler(index, data) {
                this.$delete(this.actionList, index);
                console.log(this.actionList);
                this.checkActionData()
            },
            saveActions() {
                console.log(this.actionList);
                // return;
                if (this.jobTitle && this.jobDesc && this.actionList.length) {
                    this.$http.post('/api/saveJob', {
                        jobId: this.$route.params.id,
                        jobTitle: this.jobTitle,
                        jobDesc: this.jobDesc,
                        actionList: this.actionList
                    }).then(res => {
                        if (res.status == 200 && res.data.status == 0) {
                            this.$confirm('保存成功,点击确定跳转job详情页', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'success'
                            }).then(() => {
                                this.$router.push('/job-detail/' + res.data.result._id)
                            });
                        } else {
                            this.$notify.error({
                                title: '保存失败',
                            });
                        }
                    })
                } else {
                    this.$message({
                        message: '请填写必要信息',
                        type: 'warning'
                    })
                }
            }
        }
    }
</script>

<style>
    .input-with-select .el-input-group__prepend {
        min-width: 130px;
    }

    .action-type-add {
        margin: 10px 0;
    }

    .action-item {
        margin-top: 10px;
    }

    .comp-btns {
        float: right;
        position: relative;
        top: -8px;
    }
</style>