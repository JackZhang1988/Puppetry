import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueSocketio from 'vue-socket.io';
import axios from 'axios'

import App from './App.vue'
import JobList from './pages/job-list.vue'
import JobAdd from './pages/job-add.vue'
import JobDetail from './pages/job-detail.vue'
import JobResult from './pages/job-result.vue'

import Delay from './components/delay-action.vue';
import Screenshot from './components/screenshot-action.vue';
import Gourl from './components/gourl-action.vue';
import Screendiff from './components/screendiff-action.vue';
import Loop from './components/loop-action.vue';
import Cookie from './components/cookie-action.vue';
import PuppeteerPage from './components/puppeteer-action.vue';
import Code from './components/code-action.vue';
import VueCodemirror from 'vue-codemirror'

// require codemirror styles
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/neo.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/javascript-lint.js'

Vue.component('Delay', Delay)
Vue.component('Screenshot', Screenshot)
Vue.component('Gourl', Gourl)
Vue.component('Screendiff', Screendiff)
Vue.component('Loop', Loop)
Vue.component('PuppeteerPage', PuppeteerPage)
Vue.component('Cookie', Cookie)
Vue.component('CodeScript', Code)
Vue.use(VueCodemirror, {
  options: {
    mode: {
      name: 'javascript',
      globalVars: true
    },
    theme: 'neo',
    lineWrapping: true,
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    line: true,
  }
})

Vue.use(VueSocketio, 'http://localhost:3000');
Vue.use(ElementUI)
Vue.use(VueRouter)
  .prototype.$http = axios

const routes = [{
  path: '/job-list',
  component: JobList
}, {
  path: '/job-add',
  component: JobAdd
}, {
  path: '/job-edit/:id',
  component: JobAdd
}, {
  path: '/job-detail/:id',
  component: JobDetail
}, {
  path: '/job-result/:id',
  component: JobResult
}]

const router = new VueRouter({
  routes
})

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})