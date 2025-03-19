<template>
  <el-container id="user-activity">
    <el-header>
      <el-input v-model.trim="searchUsername" placeholder="请输入用户名" style="width: 200px;">
        <template #append>
          <span class="search-btn" @click="searchActivity">搜索</span>
        </template>
      </el-input>
    </el-header>
    <el-table :data="activityData.records" class="eltable" style="max-height: 650px;">
      <el-table-column prop="timestamp" label="时间" width="180"></el-table-column>
      <el-table-column prop="username" label="用户名" width="120"></el-table-column>
      <el-table-column prop="action" label="行为" width="120"></el-table-column>
      <el-table-column prop="details" label="详情"></el-table-column>
    </el-table>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="activityData.current"
      :page-size="activityData.pageSize"
      :total="activityData.total"
      layout="total, prev, pager, next, jumper"
      style="margin: 15px 0 0 5px;"
    />
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import request from '@/config/request'
import { showError, showLoading, hideLoading } from '@/utils/utils'
import { USER_API } from '@/config/api'

import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();

const activityData = ref({
  records: [],
  total: 0,
  current: 1,
  pageSize: 20
})

const searchUsername = ref<string>('')

const fetchData = async (page = 1) => {
  try {
    showLoading()
    const response: any = await request({
      url: USER_API.GET_USER_ACTIVITIES,
      method: 'get',
      params: {
        pageNum: page,
        pageSize: activityData.value.pageSize,
        username: searchUsername.value
      }
    })
    if (response.code === 200) {
      activityData.value.records = response.data.records
      activityData.value.total = response.data.total
    } else {
      showError(response.message)
    }
  } catch (error: any) {
    showError(error)
  } finally {
    hideLoading()
  }
}

const handleCurrentChange = (page: number) => {
  activityData.value.current = page
  fetchData(page)
}

const searchActivity = () => {
  fetchData(1)
}

onMounted(() => {
  let routeName = router.currentRoute.value.path;
  setTimeout(() => {
    if (route.path === routeName) {
      fetchData()
    }
  });
})
</script>

<style scoped>
#user-activity {
  height: 100%;
  width: 100%;
  position: relative;
  .el-header {
    background-color: #f5f7fa;
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-table {
    overflow-y: auto;
    min-height: calc(100vh - 250px);
  }

  .el-button {
    margin-left: 10px;
  }
  .search-btn {
    cursor: pointer;
  }
}
</style>