<template>
  <el-container class="welcome-container">
    <div class="welcome-message">
      <h1>欢迎来到管理系统</h1>
      <p>在这里，您可以管理用户、产品和其他资源。</p>
    </div>
  </el-container>
</template>

<script setup lang="ts">

</script>

<style lang="scss">
.welcome-container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  .add-button {
    margin: 10px;
  }

  .welcome-message {
    text-align: center;
    margin-top: 50px;

    h1 {
      font-size: 2.5rem;
      color: #333;
    }

    p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 20px;
    }

    el-button {
      margin: 0 10px;
    }
  }
}
</style>