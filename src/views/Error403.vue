<template>
  <div class="error-page">
    <h1>403</h1>
    <p>对不起，您没有权限访问此页面。</p>
    <router-link to="/login">返回登录</router-link>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.error-page {
  text-align: center;
  margin-top: 50px;
}

.error-page h1 {
  font-size: 100px;
  margin-bottom: 20px;
}

.error-page p {
  font-size: 20px;
  margin-bottom: 20px;
}

.error-page a {
  color: #007bff;
  text-decoration: none;
  font-size: 18px;
}
</style>
