<template>
    <el-card class="box-card action-item deley">
        <div slot="header" class="clearfix">
            <span>延时操作</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-input v-model="data.delayTime" placeholder="设置delay时间" type="number">
            <template slot="append">毫秒</template>
        </el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    delayTime: null
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
        }
    }
</script>
<style>

</style>