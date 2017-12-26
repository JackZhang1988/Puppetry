<template>
    <el-card class="box-card action-item deley">
        <div slot="header" class="clearfix">
            <span>添加验证URL</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-input placeholder="添加验证URL" v-model="data.urlInput" class="action-item input-with-select">
        </el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    urlInput: '',
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

</style>