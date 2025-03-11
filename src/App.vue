<template>
  <div style="height: 100%;overflow: hidden;">
    <RouterView />
    <div id="dialog"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import router from '@/router';
import { useStore } from 'vuex';
import { Base64 } from 'js-base64';

const store = useStore();

onMounted(function(){
})

</script>

<style lang="scss">
</style>
