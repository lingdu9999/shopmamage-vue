<template>
    <el-form :model="form" label-width="100px">
      <el-form-item label="物流单号">
        <el-input v-model="form.trackingNumber" />
      </el-form-item>
      <el-button type="primary" @click="handleShipOrder" style="float: right;">发货</el-button>
    </el-form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import request from '@/config/request';
import { ORDER_API } from '@/config/api';
import { showSuccess, showError } from '@/utils/utils';

const props = defineProps<{
  order: any;
  s: (data?:any) => void;
  e: (data?:any) => void;

}>();

const form = ref({
  trackingNumber: '',
});

const handleShipOrder = async () => {
  if (!form.value.trackingNumber) {
    showError('请输入物流单号');
    return;
  }
  try {
    
    const response: any = await request({
      url: `${ORDER_API.UPDATE_ORDER_STATUS}/${props.order!.orderId}`, // Replace with your actual API endpoint
      method: 'put',
      params: {
        trackingNumber: form.value.trackingNumber,
        status: 2, // Assuming 2 is the "Shipped" status
      },
    });

    if (response.code === 200) {
      showSuccess('发货成功');
      props.s();
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  }
};
</script>
