<template>
    <el-card class="box-card action-item cookie">
        <div slot="header" class="clearfix">
            <span>Cookie操作</span>
            <slot name="action" :data="data"></slot>
        </div>
        <el-switch class="screen-target" v-model="data.cookieAdd" active-color="#13ce66" inactive-color="#ff4949" active-text="添加"
            inactive-text="删除">
        </el-switch>

        <el-input v-model="data.cookie" placeholder="设置cookie字符串，可以直接粘贴document.cookie" type="textarea">

        </el-input>
        <el-input class="sub-input" v-model="data.path" placeholder="输入path（默认'/'）" type="text"></el-input>
        <el-input class="sub-input" v-model="data.domain" placeholder="输入domain (默认 weidian.com)" type="text"></el-input>
        <el-input class="sub-input" v-model="data.expire" placeholder="输入过期时间" type="text"></el-input>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {
                    cookieAdd: true,
                    cookie: null,
                    expire: null,
                    path: null,
                    domain: null,
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
    .sub-input.el-input {
        width: 280px;
        margin-right: 10px;
        margin-top: 10px;
    }
</style>