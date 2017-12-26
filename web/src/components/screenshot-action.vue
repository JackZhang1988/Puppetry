<template>
    <el-card class="action-item screenshot box-card">
        <div slot="header" class="clearfix">
            <span>屏幕快照</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-switch class="screen-target" v-model="data.isReference" active-color="#13ce66" inactive-color="#ff4949" active-text="引用"
            inactive-text="快照">
        </el-switch>
        <div class="sub-info" v-if="$route.params.id&&data.isReference">快照对比id（快照对比任务可以复制此id）：<span class="diff-id">{{$route.params.id+'-'+index}}</span></div>
        <el-input placeholder="区域selecter" v-model="data.selecterInput" class="input-with-select" :disabled="data.screenshotType == 2">
            <el-select v-model="data.screenshotType" slot="prepend" placeholder="请选择截图区域">
                <el-option label="指定区域" value="1"></el-option>
                <el-option label="全屏" value="2"></el-option>
            </el-select>
        </el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    selecterInput: null,
                    screenshotType: "1",
                    isReference: false,
                },
                inputDisable: false,
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
        }
    }
</script>
<style>
    .screen-target {
        padding-bottom: 20px;
    }

    .sub-info {
        margin-left: 10px;
        color: #999;
        float: right;
        font-size: 14px;
    }
    .diff-id{
        font-size: 16px;
        color:rgb(90, 90, 90);
    }
</style>