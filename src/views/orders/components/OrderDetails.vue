<template>
  <el-descriptions
        v-if="selectedOrder.order"
        :column="3"
        border
      >
        <el-descriptions-item label="订单号">{{ selectedOrder.order.orderNumber }}</el-descriptions-item>
        <el-descriptions-item label="客户名">{{ selectedOrder.order.buyerName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ selectedOrder.order.buyerPhoneNumber }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ selectedOrder.order.shippingAddress }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ selectedOrder.order.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item label="订单日期">{{ selectedOrder.order.orderDate }}</el-descriptions-item>
        <el-descriptions-item label="总金额">{{ selectedOrder.order.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getOrderStatusType(selectedOrder.order.status)">
            {{ getOrderStatusText(selectedOrder.order.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物流单号">{{ selectedOrder.order.trackingNumber }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">{{ selectedOrder.order.paymentStatus === 1 ? '已支付':'未支付' }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="selectedOrder.orderItems" v-if="selectedOrder.orderItems">
        <el-table-column prop="product.mainImage" label="商品图片">
          <template #default="scope">
            <el-image style="width: 50px; height: 50px" :src="FILE_URL + scope.row.product.mainImage" :preview-src-list="[FILE_URL + scope.row.product.mainImage]" />
          </template>
        </el-table-column>
        <el-table-column prop="product.name" label="商品名称" />
        <el-table-column prop="product.sku" label="商品SKU" />
        <el-table-column prop="orderItem.quantity" label="数量" />
        <el-table-column prop="orderItem.price" label="价格" />
        <el-table-column label="商品属性">
          <template #default="scope">
            <div v-for="attribute in scope.row.orderItemAttributes" :key="attribute.orderItemAttributeId">
              {{ attribute.attributeValue }}
            </div>
          </template>
        </el-table-column>
      </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElTable, ElTag,  ElDescriptions, ElDescriptionsItem, ElImage,ElTableColumn } from 'element-plus';
import request from '@/config/request';
import {ORDER_API,FILE_URL} from '@/config/api';
import { showSuccess, showError } from '@/utils/utils';

const props = defineProps<{
  order: any;
  
  s: (data?:any) => void;
  e: (data?:any) => void;
}>();
const selectedOrder = ref<any>({});

const getOrderDeatil = async () => {
  try {
    const response: any = await request({
      url: `${ORDER_API.GET_ORDER_DETAILS}/${props.order.orderId}`, // Replace with your actual API endpoint
      method: 'post',
    });

    if (response.code === 200) {
      selectedOrder.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  }
};


const getOrderStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待付款';
    case 1:
      return '待发货';
    case 2:
      return '已发货';
    case 3:
      return '已完成';
    case 4:
      return '已取消';
    default:
      return '未知状态';
  }
};

const getOrderStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'info';
    case 1:
      return 'warning';
    case 2:
      return 'success';
    case 3:
      return 'success';
    case 4:
      return 'danger';
    default:
      return 'primary';
  }
};


onMounted(() => {
  if (props.order === null) {
    showError('订单信息为空');
    return;
  }
  console.log(props.order);
  
  getOrderDeatil();
});
</script>


<style lang="scss" scoped>

</style>