<template>
  <div class="root">
    <div class="article-wrap">
      <div class="title-logo">
        <span class="">P</span>uppe<span class="strong">try</span>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        title: 'Welcome Puppetry Show!'
      }
    },

    methods: {
      goLink(routerPath) {
        this.$router.push('/' + routerPath);
      }
    }
  }
</script>

<style>
  .logo {
    width: 80px;
    margin: 10px;
  }

  .title-logo {
    font-size: 30px;
    font-weight: bolder;
    color: #3D78B7;
    padding: 10px;
  }

  .strong {
    color: #f6cf5b;
  }

  .root {
    overflow: hidden;
  }

  .root .article-wrap {
    min-height: 100vh;
    /* margin-left: 215px; */
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-direction: normal;
    -webkit-box-orient: vertical;
    -webkit-flex-direction: column;
    -moz-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 0 20px;
  }

  .el-breadcrumb {
    padding: 10px 0;
  }
</style>