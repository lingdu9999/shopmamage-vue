<template>
  <div class="stats-page">
    <div class="button-group">
      <button @click="setTimeRange('7d')">近七天</button>
      <button @click="setTimeRange('30d')">近三十天</button>
      <button @click="setTimeRange('all')">全部</button>
    </div>
    <div class="charts-container">
      <div id="order-stats" class="chart-container"></div>
      <div id="order-amount-stats" class="chart-container"></div>
      <div id="status0-orders-stats" class="chart-container"></div>
      <div id="status2-orders-stats" class="chart-container"></div>
      <div id="status4-orders-stats" class="chart-container"></div>
    </div>
    
    <div id="category-stats" class="chart-container" style="height: 500px;"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted,nextTick } from 'vue'
import * as echarts from 'echarts'
import request from '@/config/request'
import { STATISTICS_API } from '@/config/api'
import { showError } from '@/utils/utils';
// import router from '@/router';
import { useRoute, useRouter } from 'vue-router';

const timeRange = ref('7d');
const chartData = ref(0);
const amountData = ref(0);
const status0OrdersData = ref(0);
const status2OrdersData = ref(0);
const status4OrdersData = ref(0);
const categoryData = ref<{ [key: string]: number }>({});

const fetchData = async () => {
  try {
    const response:any = await request.get(STATISTICS_API.GET_ECHARTS_DATA);
    if (response.code === 200) {
      const data = response.data;
      if (timeRange.value === '7d') {
        chartData.value = data.last7Days.orderCount;
        amountData.value = data.last7Days.totalPayment;
        status0OrdersData.value = data.last7Days.status0Orders;
        status2OrdersData.value = data.last7Days.status2Orders;
        status4OrdersData.value = data.last7Days.status4Orders;
      } else if (timeRange.value === '30d') {
        chartData.value = data.last30Days.orderCount;
        amountData.value = data.last30Days.totalPayment;
        status0OrdersData.value = data.last30Days.status0Orders;
        status2OrdersData.value = data.last30Days.status2Orders;
        status4OrdersData.value = data.last30Days.status4Orders;
      } else {
        chartData.value = data.allTime.orderCount;
        amountData.value = data.allTime.totalPayment;
        status0OrdersData.value = data.allTime.status0Orders;
        status2OrdersData.value = data.allTime.status2Orders;
        status4OrdersData.value = data.allTime.status4Orders;
      }
      updateCharts();
    } else {
      showError(response.message);
    }
  } catch (error:any) {
    showError(error+'1111');
  }
};

const fetchCategoryData = async () => {
  try {
    const response:any = await request.get(STATISTICS_API.GET_CATEGORY_DATA);
    if (response.code === 200) {
      categoryData.value = response.data;
      updateCategoryChart();
    } else {
      showError(response.message);
    }
  } catch (error:any) {
    showError(error);
  }
};

const setTimeRange = (range: string) => {
  timeRange.value = range;
  if (timeRange.value !== null) {
    fetchData();
  }
};

const updateCharts = () => {
  updateChart('order-stats', chartData.value, '订单数量');
  updateChart('order-amount-stats', amountData.value, '销售金额');
  updateChart('status0-orders-stats', status0OrdersData.value, '未付款');
  updateChart('status2-orders-stats', status2OrdersData.value, '已完成');
  updateChart('status4-orders-stats', status4OrdersData.value, '已取消');
};

const updateChart =  (elementId: string, data: number, title: string) => {
  const chartDom = document.getElementById(elementId)!;
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: title,
      left: 'center',
      show: false
    },
    series: [
      {
        name: title,
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        radius: '75%',
        pointer: {
          show: false
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: '#464646'
          }
        },
        axisLine: {
          lineStyle: {
            width: 20
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        },
        data: [
          {
            value: data,
            name: title,
            title: {
              offsetCenter: ['0%', '-30%']
            },
            detail: {
              valueAnimation: true,
              offsetCenter: ['0%', '0%']
            }
          }
        ],
        title: {
          fontSize: 20
        },
        detail: {
          width: 45,
          height: 14,
          fontSize: 20,
          color: 'auto',
          formatter: '{value}'
        }
      }
    ]
  };
  myChart.setOption(option);
};

const updateCategoryChart = () => {
  const categories = Object.keys(categoryData.value);
  const data = Object.values(categoryData.value);
  const chartDom = document.getElementById('category-stats')!;
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: '整体分类统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data,
        type: 'line'
      }
    ]
  };
  myChart.setOption(option);
};
const route = useRoute();
const router = useRouter();

onMounted(() => {
  let routeName = router.currentRoute.value.path;
  setTimeout(() => {
    if (route.path === routeName) {
      fetchData();
      fetchCategoryData();
    }
  });
});

</script>

<style scoped>
.stats-page {
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

h1 {
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
}

.button-group button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #0056b3;
}

.charts-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.chart-container {
  flex: 1;
  height: 200px;
  margin: 20px 10px;
  border-radius: 10px;
  background-color: white;
  padding: 10px;
}
</style>