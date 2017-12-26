<template>
    <el-card class="box-card action-item deley">
        <div slot="header" class="clearfix">
            <span>添加puppeteer page操作</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-button type="text">
            <a target="_blank" href="https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md" class="link">Puppeteer API文档</a>
        </el-button>
        <el-form ref="form" label-width="120px">
            <el-form-item label="page action类型">
                <el-input placeholder="请填写page执行函数" v-model="data.actionType"></el-input>
            </el-form-item>
            <el-form-item label="page action参数">
                <el-input class="action-param" placeholder="page action参数" v-model="data.actionParams[index]" v-for="(param,index) in data.actionParams" :key="index">
                        <el-button slot="append" icon="el-icon-circle-close" @click="delParam(index)"></el-button>
                </el-input>
                <el-button @click="addParam">添加action参数</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    actionType: '',
                    actionParams: []
                }
            }
        },
        created() {
            if (this.defaultData) {
                this.data = this.defaultData;
            }
            this.$emit('init', {
                index: this.index,
                data: this.data
            })
        },
        methods: {
            addParam() {
                this.data.actionParams.push('');
            },
            delParam(index){
                this.data.actionParams.splice(index, 1);
            }
        }
    }
</script>
<style>
    .action-param {
        margin: 5px 0;
    }
</style>