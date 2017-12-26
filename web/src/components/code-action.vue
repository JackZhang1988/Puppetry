<template>
    <el-card class="box-card action-item deley">
        <div slot="header" class="clearfix">
            <span>添加js code</span>
            <slot name="action" :data="data"></slot>
        </div>
        <codemirror v-model="data.code"></codemirror>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    code: '',
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