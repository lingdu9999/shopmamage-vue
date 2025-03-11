<template>
  <el-container id="orders">
    <el-header class="header">
      <el-select v-model="searchOrderStatus" placeholder="选择订单状态" clearable>
        <el-option label="全部" value="" />
        <el-option label="待付款" :value="0" />
        <el-option label="待发货" :value="1" />
        <el-option label="已发货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
      </el-select>
      <el-date-picker
        v-model="searchDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="margin-left: 20px;"
        clearable
      />
      <el-input v-model.trim="searchOrderNumber" placeholder="请输入订单号" style="width: 200px;">
        <template #append>
          <span class="search-btn" @click="searchOrder">搜索</span>
        </template>
      </el-input>
      <el-button type="danger" @click="clearSearch" style="margin-left: 80px;">清除搜索</el-button>
    </el-header>
    <el-table :data="orders" max-height="calc(100vh - 250px)">
      <el-table-column prop="order.orderNumber" label="订单号" width="150" />
      <el-table-column prop="order.buyerName" label="客户名" width="120" />
      <el-table-column prop="order.buyerPhoneNumber" label="电话" width="120" />
      <el-table-column prop="order.shippingAddress" label="收货地址" min-width="200" />
      <el-table-column prop="order.paymentMethod" label="支付方式" width="100" />
      <el-table-column prop="order.orderDate" label="订单日期" width="160" />
      <el-table-column prop="order.totalAmount" label="总金额" width="90" />
      <el-table-column prop="order.status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.order.status)">
            {{ getOrderStatusText(scope.row.order.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button size="small" @click="viewOrderDetails(scope.row)">查看详情</el-button>
          <el-button
            v-if="scope.row.order.status === 1"
            size="small"
            type="primary"
            @click="openShipOrderDialog(scope.row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      style="margin: 15px 0 0 5px;"
    />

  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, App } from 'vue';
import { ElContainer, ElHeader, ElTable, ElButton, ElPagination, ElInput, ElTag, ElDatePicker, ElDialog, ElSelect, ElOption, ElDescriptions, ElDescriptionsItem, ElImage } from 'element-plus';
import request from '@/config/request';
import { ORDER_API, FILE_URL } from '@/config/api';
import { showSuccess, showError, showDialog, closeDialog } from '@/utils/utils';
import OrderDetails from './components/OrderDetails.vue';
import ShipOrderDialog from './components/ShipOrderDialog.vue';

const orders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchOrderNumber = ref('');
const searchDateRange = ref([]);
const searchOrderStatus = ref('');

const clearSearch = () => {
  searchOrderNumber.value = '';
  searchDateRange.value = [];
  searchOrderStatus.value = '';
  currentPage.value = 1;
  getOrders();
};

const getOrders = async () => {
  try {
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };

    if (searchOrderStatus.value !== '') {
      params.orderStatus = searchOrderStatus.value;
    }

    if (searchDateRange.value && searchDateRange.value.length === 2) {
      params.startDate = formatDate(searchDateRange.value[0]);
      params.endDate = formatDate(searchDateRange.value[1]);
    }

    if (searchOrderNumber.value) {
      params.orderNumber = searchOrderNumber.value;
    }

    const response: any = await request({
      url: ORDER_API.GET_ALL_ORDERS, // Update with your API endpoint
      method: 'get',
      params: params,
    });

    if (response.code === 200) {
      orders.value = response.data.records; // Assuming the records are in response.data.records
      total.value = response.data.total;
      currentPage.value = response.data.current;
      pageSize.value = response.data.pageSize;
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  }
};

const searchOrder = () => {
  currentPage.value = 1;
  getOrders();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getOrders();
};

const viewOrderDetails = async (row: any) => {
  try {
    let res: any = await showDialog({
      title: '订单详情',
      visible: true,
      footer: false,
      width: '80%',
      slots: {
        content: {
          component: OrderDetails,
          props: {
            order: row.order,
          }
        }
      }
    });
    closeDialog(res as App<Element>);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }
};

const openShipOrderDialog = async (row: any) => {
  try {
    let res: any = await showDialog({
      title: '发货',
      visible: true,
      footer: false,
      width: '360px',
      slots: {
        content: {
          component: ShipOrderDialog,
          props: {
            order: row.order,
          }
        }
      }
    });
    closeDialog(res as App<Element>);
    getOrders();
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
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

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  getOrders();
});
</script>

<style lang="scss" scoped>
#orders {
  height: 100%;
  width: 100%;
  position: relative;

  .el-header {
    background-color: #f5f7fa;
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }
  .el-select {
    margin-left: 20px;
    width: 150px;
  }

  .el-input {
    margin-left: 20px;
  }

  .el-date-picker {
    margin-left: 20px;
  }

  .el-button {
    margin-left: 20px;
  }

  .date-picker {
    margin-left: 20px;
  }
  .el-table {
    min-height: calc(100vh - 250px);
    overflow-y: auto;
  }

  .search-btn {
    cursor: pointer;
  }
}
</style>

