<template>
    <el-card class="box-card action-item">
        <div slot="header" class="clearfix">
            <span>检测Page Performance</span>
            <slot name="action" :data="data"></slot>
        </div>
        <ul>
            <li>
                白屏时间 whiteScreen= timing.responseEnd - timing.fetchStart; 
            </li>
            <li>
                首屏时间 firstScreen = window.firstScreenTime -window.performance.timing.fetchStart
            </li>
            <li>
                用户可交互时间 domReady = timing.redirectEnd - timing.redirectStart;
            </li> 
            <li>
                总下载时间 onLoad = timing.responseEnd - timing.requestStart
            </li>
            <li>
                HTML下载时间 dns = timing.domainLookupEnd - timing.domainLookupStart 
            </li>
            <li>
                TCP连接时间 tcp = timing.connectEnd - timing.connectStart;
            </li>
            <li>
                HTTP请求时间 httpRequest = timing.responseEnd - timing.requestStart;
            </li> 
            <li>
                HTTP响应时间 httpRespond = timing.responseStart - timing.navigationStart
            </li>
        </ul>
    </el-card>
</template>
<script>
    export default {
        props: ['defaultData', 'index'],
        data() {
            return {
                data: {}
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