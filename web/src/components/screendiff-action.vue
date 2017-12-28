<template>
    <el-card class="action-item screendiff box-card">
        <div slot="header" class="clearfix">
            <span>快照diff操作（请添加生成图片引用的job id）</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-input placeholder="diff引用id" v-model="data.referenceId" class="input-with-select">
        </el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    referenceId: ''
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
        methods: {}
    }
</script>
<style>

</style>