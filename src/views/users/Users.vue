<template>
  <el-container id="users">
    <el-header>
      <el-button @click="openUserDetail(null)" type="primary" v-if="permissions.includes('ADD_USER')">增加用户</el-button>
      <el-button @click="deleteUsers" type="primary" v-if="permissions.includes('DELETE_USER')">删除用户</el-button>
      
      <el-select v-model="selectUserType" style="width: 115px;margin-left: 20px;" placeholder="选择类型" clearable>
        <el-option label="选择类型" :value="-1" />
        <el-option label="管理员" :value="0" />
        <el-option label="员工" :value="1" />
        <el-option label="用户" :value="2" />
      </el-select>
      <el-input v-model.trim="searchUsername" placeholder="请输入用户名" style="width: 200px;margin-left: 20px;" >
        <template #append>
          <span class="search-btn" @click="searchUser">搜索</span>
        </template>
      </el-input>
    </el-header>
    <el-table :data="users" @selection-change="selectionChange" class="eltable">
      <el-table-column type="selection" width="55" :selectable="selectable"/>
      <el-table-column prop="username" label="用户名" width="180"/>
      <el-table-column prop="email" label="邮箱" width="280"/>
      <el-table-column prop="phone" label="电话" width="180"/>
      <el-table-column prop="role" label="类型" width="100">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.role == 1">管理员</el-tag>
          <el-tag type="primary" v-else-if="scope.row.role == 2">员工</el-tag>
          <el-tag type="danger" v-else>用户</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="个性签名" />
      <el-table-column prop="issuse" label="状态" width="100">
        <template #default="scope">
          <el-text type="primary" v-if="scope.row.issuse == 1">启用</el-text>
          <el-text type="danger" v-else>禁用</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="image" label="头像" width="100">
        <template #default="scope">
          <el-image :src="FILE_URL + scope.row.image" style="width: 40px; height: 40px;" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" v-if="permissions.includes('UPDATE_USER') || permissions.includes('DELETE_USER') || permissions.includes('DIS_USER')">
        <template #default="scope">
          <el-button type="primary" @click="openUserDetail(scope.row)" size="small" v-if="permissions.includes('UPDATE_USER')">编辑</el-button>
          <el-button type="danger" @click="deleteUser(scope.row.userId)" size="small" v-if="permissions.includes('DELETE_USER')">删除</el-button>
          <el-button @click="changeUserStatus(scope.row)" :type="scope.row.issuse ? 'info' : 'success'" size="small" v-if="permissions.includes('DIS_USER')">{{scope.row.issuse ? '禁用' : '启用'}}</el-button>
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
    <!-- <user-detail
      :userData="selectedUser"
      :dialogVisible="userDetailVisible"
      @close="closeUserDetail"
      @submit="addOrUpdateUser"
    /> -->
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, App,} from 'vue';
import { ElContainer, ElHeader, ElTable, ElButton, ElPagination } from 'element-plus';
import request from '@/config/request';
import { FILE_URL } from '@/config/api';
import { useStore } from 'vuex';
import UserDetail from './components/userDetail.vue';
import { UserInfo } from '@/config/common';
import { showSuccess, showError,showDialog,closeDialog,showLoading,hideLoading } from '@/utils/utils';
import { REGISTER_URL, USER_API } from '@/config/api';


let users = ref<UserInfo[]>([]); // 存储用户列表
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的用户数量
const total = ref(0); // 用户总数

const store = useStore();

const searchUsername = ref<string>('');
const selectUserType = ref<number>(-1);

const selectUserList = ref<UserInfo[]>([]);
const permissions = computed(() => store.state.permissionList);


const selectionChange = (selection:UserInfo[]) => {
  selectUserList.value = selection;
  console.log(selectUserList.value);
}

const selectable = (row: UserInfo) => {
  return row.userId != store.state.userInfo.userId;
}

const searchUser = async () => {
  getUsers(true);
}

const changeUserStatus = async (user: UserInfo) => {
  try{
    let res = await showDialog({
      title : '提示',
      visible : true,
      width: '300px',
      slots: {
        default: '确定要修改状态吗',
      }
    })
    console.log(res,'res');
    closeDialog(res as App<Element>);
    
  }catch(error){
    closeDialog(error as App<Element>);
    console.log(error,'error');
    return;
  }

  try{
    showLoading();
    let res:any = await request({
      url: USER_API.DISABLE_STATUS_URL,
        method: 'get',
        params: {
          status: user.issuse ? 0 : 1,
          userId: user.userId
        }
    });
    if(res.code == 200){
      showSuccess('操作成功');
      getUsers();
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      showError(error.response.data.message);
    } else {
      showError('修改用户状态失败');
    }
  }finally{
    hideLoading();
  }
}

const openUserDetail = async (user: UserInfo | null) => {
  try{
    let res:any = await showDialog({
      title : user? "编辑用户":"添加用户",
      visible : true,
      width: '500px',
      footer:false,
      slots: {
        content: {
          component: UserDetail,
          props: {
            userData: JSON.parse(JSON.stringify(user)),
          }
        }
      }
    })
    closeDialog(res);
    addOrUpdateUser(res.data);
  }catch(error){
    closeDialog(error);
    return;
  }
}

const addOrUpdateUser = async (user: UserInfo) => {

  // 处理用户提交逻辑（添加或更新用户）
  try{
    const res:any = await request({
      url: user.userId ? USER_API.UPDATE_USER_URL : REGISTER_URL,
      method: 'post',
      data: user
    });
    if(res.code == 200){
      showSuccess('操作成功');
      getUsers();
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    showError(error)
  }
}

const deleteUsers = async () => {
  if(selectUserList.value.length == 0){
    showError('请选择要删除的用户');
    return;
  }
  let userIds = selectUserList.value.map(user => user.userId);
  deleteUser(userIds.join('/'));
}

const deleteUser = async (userId: number | string) => {
  try{
    let res = await showDialog({
      title : '提示',
      visible : true,
      width: '300px',
      slots: {
        default: '确定要删除吗'
      }
    })
    closeDialog(res as App<Element>);
    
  }catch(error){
    closeDialog(error as App<Element>);
    return;
  }
  try{
    showLoading();
    const res:any = await request({
      url: USER_API.DELETE_USER_URL+'/'+userId,
      method: 'delete',
    });
    if(res.code == 200){
      showSuccess('删除成功');
      getUsers();
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    if (error.response && error.response.data && error.response.data.message) {
      showError(error.response.data.message);
    } else {
      showError('删除用户失败');
    }
  }finally{
    hideLoading();
  }
}

const getUsers = async (search?:boolean) => {
  try {
    showLoading();
    const response: any = await request({
      url: USER_API.GET_ALL_USERS_URL,
      method: 'post',
      data: {
        pageNum: search ? 1 : currentPage.value,
        pageSize: pageSize.value,
        username: searchUsername.value,
        role: selectUserType.value 
      }
    });

    if (response.code == 200) {
      users.value = response.data.records;
      total.value = response.data.total;
      currentPage.value = response.data.current;
      pageSize.value = response.data.pageSize;
    }
  } catch (error:any) {
    showError(error)
  }finally{
    hideLoading();
  }
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getUsers();
};

const getRole = computed(() => {
  return store.state.userInfo.role;
});

const getUserId = computed(() => {
  return store.state.userInfo.userId;
});

onMounted(getUsers); // 组件挂载后获取用户数据
</script>

<style lang="scss" scoped>
#users {
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
  .search-btn{
    cursor: pointer;
  }
}
</style>