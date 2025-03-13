<template>
  <el-container>
    <el-header style="background-color: #f5f7fa; padding: 10px; border-bottom: 1px solid #e4e7ed;">
      <el-button type="primary" @click="openAddPermissionDialog">添加权限</el-button>
    </el-header>
    <el-main style="height: 50vh;">
      <el-table :data="permissions" style="width: 100%;">
        <el-table-column prop="permissionName" label="权限名称" width="150" />
        <el-table-column prop="permissionCode" label="权限代码"/>
        <el-table-column prop="url" label="URL"/>
        <el-table-column prop="pageUrl" label="页面URL"/>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deletePermission(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <!-- Add Permission Dialog -->
    <el-dialog v-model="addPermissionDialogVisible" title="添加权限" width="30%" :close-on-click-modal="false" top="25vh">
      <el-form :model="permissionForm" label-width="100px">
        <el-form-item label="权限名称">
          <el-input v-model="permissionForm.permissionName" />
        </el-form-item>
        <el-form-item label="权限代码">
          <el-input v-model="permissionForm.permissionCode" />
        </el-form-item>
        <el-form-item label="URL">
          <el-input v-model="permissionForm.url" />
        </el-form-item>
        <el-form-item label="页面URL">
          <el-select v-model="permissionForm.pageUrl" placeholder="选择页面URL">
            <el-option
              v-for="menu in menuList"
              :key="menu.id"
              :label="menu.label"
              :value="menu.path"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addPermissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermission">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted,App,defineEmits } from 'vue';
import { ElContainer, ElHeader, ElMain, ElButton, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
import request from '@/config/request';
import { showSuccess, showError, showLoading, hideLoading,showDialog,closeDialog } from '@/utils/utils';
import { ROLES_API, MENU_API } from '@/config/api';

const permissions = ref([]);
const addPermissionDialogVisible = ref(false);
const permissionForm = ref({
  permissionName: '',
  permissionCode: '',
  url: '',
  pageUrl: '',
});
const menuList = ref<any>([]);

const emit = defineEmits(['saveSuccess']);

const getAllPermissions = async () => {
  try {
    showLoading();
    const response: any = await request({
      url: ROLES_API.GET_ALL_PERMISSIONS,
      method: 'get',
    });

    if (response.code === 200) {
      permissions.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

const getMenuList = async () => {
  try {
    showLoading();
    const response: any = await request({
      url: MENU_API.GET_MENU_LIST,
      method: 'get',
    });

    if (response.code === 200) {
      menuList.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

const openAddPermissionDialog = () => {
  permissionForm.value = {
    permissionName: '',
    permissionCode: '',
    url: '',
    pageUrl: '',
  };
  addPermissionDialogVisible.value = true;
};

const savePermission = async () => {
  try {
    showLoading();
    const response: any = await request({
      url: ROLES_API.ADD_PERMISSION,
      method: 'post',
      data: permissionForm.value,
    });

    if (response.code === 200) {
      showSuccess('权限添加成功');
      addPermissionDialogVisible.value = false;
      emit('saveSuccess');
      getAllPermissions();
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

const deletePermission = async (permissionId: number) => {
  console.log(permissionId);
  
  try {
    let res = await showDialog({
      title: '提示',
      visible: true,
      width: '300px',
      slots: {
        default: '确定要删除这个权限吗？',
      }
    });
    closeDialog(res as App<Element>);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }

  try {
    showLoading();
    const response: any = await request({
      url: `${ROLES_API.DELETE_PERMISSION}?permissionId=${permissionId}`,
      method: 'post',
    });

    if (response.code === 200) {
      showSuccess('权限删除成功');
      getAllPermissions();
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

onMounted(() => {
  getAllPermissions();
  getMenuList();
});
</script>
