<template>
  <el-select
    v-model="value"
    placeholder="Select"
    size="large"
    style="width: 240px"
  >
    <el-option label="上架" :value="1" />
    <el-option label="下架" :value="3" />
  </el-select>
  <div style="margin-top: 20px;float: right;">
    <el-button type="primary" @click="confirm">确认</el-button>
    <el-button  @click="props.e">取消</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElSelect, ElOption,ElButton } from 'element-plus';

const value = ref(1);

const props = defineProps<{
  s: (data?:any) => void;
  e: (data?:any) => void;
}>();

const confirm = () => {
  
  props.s(value.value);
};

</script>


<style scoped>

</style>