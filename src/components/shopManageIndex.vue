<template>
  <el-container class="app-container">
    <MenuBar :menuList="menuList" />
    <div class="infoTop">
      <el-dropdown @command="handleCommand" trigger="click">
        <span class="user-avatar" v-if="getUser">
          <el-avatar :size="40" :src="FILE_URL + getUser.image" class="user-avatar"/>
          <el-text class="username"> {{ getUser.username }}</el-text>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit">编辑账号信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-container class="content-container">
      <el-tabs v-model="activeTab" @tab-remove="removeTab" @tab-click="handleTabClick" :keep-alive="false" class="custom-tabs" type="card">
        <el-tab-pane
          v-for="(tab, index) in tabs"
          :key="tab.path"
          :label="tab.label"
          :name="tab.path"
          :closable="tab.path !== '/index/home'"
          class="custom-tab-pane"
        >
          <el-main class="custom-main">
            <router-view v-if="activeTab === tab.path" />
          </el-main>
        </el-tab-pane>
      </el-tabs>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, nextTick, provide, computed } from 'vue';
import router from '@/router';
import request from '@/config/request';
import MenuBar from '@/components/MenuBar.vue'; // 引入 MenuBar 组件
import { FILE_URL, MENU_API } from '@/config/api';
import { showError } from '@/utils/utils';
import { useStore } from 'vuex';
import { size } from 'lodash';
import { ElMessageBox } from 'element-plus';

const state = useStore();
// 定义菜单项的类型
interface MenuItem {
  label: string;
  icon: string | null;
  path: string | null;
  children: MenuItem[];
}

const menuList = ref<MenuItem[]>([]); // 设置 menuList 的类型
const activeTab = ref<string | null>('/index/home'); // 默认激活主页标签
const tabs = ref<{ label: string; path: string }[]>([{ label: '  首页  ', path: '/index/home' }]); // 标签数组，包含主页

const store = useStore();

onMounted(async () => {
  getMenuList();

  getUserPermission();
  if (!tabs.value.find(tab => tab.path === router.currentRoute.value.path)) {
    tabs.value.push({ label: router.currentRoute.value.meta.title as string, path: router.currentRoute.value.path });
  }
  activeTab.value = router.currentRoute.value.path;
});

const getUser = computed(() => {
  return store.state.userInfo;
});

// 监听路由变化，添加标签
router.afterEach((to) => {
  if (!tabs.value.find(tab => tab.path === to.path)) {
    tabs.value.push({ label: to.meta.title as string, path: to.path });
  }
  activeTab.value = to.path;
});

function handleTabClick(tab: any) {
  // 更新路由
  if (tab.props.name !== activeTab.value) {
    activeTab.value = tab.props.name; // 更新当前激活的标签
    router.push(tab.props.name); // 更新路由
  }
}

function removeTab(targetName: string) {
  tabs.value = tabs.value.filter(tab => tab.path !== targetName);
  if (activeTab.value === targetName) {
    activeTab.value = tabs.value.length ? tabs.value[tabs.value.length - 1].path : '/index'; // 如果没有标签，激活主页
    router.push(activeTab.value); // 更新路由
  }
}

const getMenuList = async () => {
  try {
    let res: any = await request.get(MENU_API.MENU_URL);
    if (res.code === 200) {
      menuList.value = res.data;
      state.commit('SET_MENU', menuList.value);
    }
  } catch (error: any) {
    showError(error);
  }
};

async function getUserPermission() {
  try {
    let res:any = await request({
      url: '/permissions/getByUser',
      method: 'get',
    })

    if (res.code === 200) {
      let permission = res.data.map((item:any) => item.permissionCode)
      store.commit('SET_PERMISSION', permission)
    } else {
      showError(res.message)
    }
  }catch (error:any) {
    showError(error)
  }
}

provide('GET_MENU', getMenuList);
provide('GET_USER_PERMISSION', getUserPermission as Function);

// 添加退出登录方法
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 清除用户信息
    store.commit('CLEAR_USER_STATE');
    // 清除token
    localStorage.removeItem('token');
    showError('退出登录')
    // 跳转到登录页
    router.push('/login');
  }).catch(() => {});
};

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout();
  } else if (command === 'edit') {
    router.push('/setting/setting');
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
  .infoTop {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    color: #f5f5f5;
    .user-avatar{
      display: flex;
      align-items: center;
      .username{
        color: #f5f5f5;
        padding: 10px;
      }
    }
  }
  .content-container {
    flex: 1;
    padding: 20px 10px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #f5f5f5;
    border-radius: 8px;
    .el-tabs {
      width: 100%;
      .custom-tab-pane {
        padding: 0;
        height: 100%;
        overflow: hidden;
        .custom-main {
          padding: 0 !important;
          height: 100%;
          width: 100%;
        }
      }
    }
  }
}
</style>
