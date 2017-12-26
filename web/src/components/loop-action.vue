<template>
    <el-card class="box-card action-item deley">
        <div slot="header" class="clearfix">
            <span>循环action</span>
            <slot name="action" :data="data"></slot>
        </div>
        <div class="action-desc">
            循环action表示该job内的行为基于数据源循环执行，用于改变某个变量情况下执行同一个任务。
            <div class="">
                数据源中的变量基于es6模板语法，可以使用${item}获得
            </div>
        </div>
        <el-input placeholder="添加循环数据源" v-model="data.loopDataSource" :rows="5" class="action-item input-with-select" type="textarea">
        </el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    loopDataSource:null,
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
        }
    }
</script>
<style>
    .action-desc{
        font-size: 14px;
    }
    .action-desc .sub{
        font-size: 12px;
        font-style: italic;
    }
</style>