<template>
  <el-dialog :model-value="visible" :title="title || '提示'" :width="width || '50%'" align-center :show-close="showClose || true" @close="handleClose" :close-on-click-modal="false">

    <div id="global-dialog-content" style="margin: 20px 0;font-size: 16px;">
      <slot>
      </slot>
      <slot name="content">
      </slot>
    </div>
    <div slot="footer" style="text-align: right;" v-if="getFooter">
      <el-button type="primary" @click="confirm">确定</el-button>
      <el-button @click="handleClose">取消</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed} from 'vue';
import { ElDialog, ElButton,ElText } from 'element-plus';

const props = defineProps<{
  title?: string;
  visible: boolean;
  width?: string;
  showClose?: boolean;
  footer?: boolean;
  success: (data?:any) => void;
  exit: (data?:any) => void;
}>();

const getFooter = computed(()=>{
  return props.footer == true || props.footer == undefined || props.footer == null;
})

const handleClose = () => {
  props.exit();
};


const confirm = () => {
  props.success();
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>