<template>
  <el-container id="roles">
    <el-header style="background-color: #f5f7fa; padding: 10px; border-bottom: 1px solid #e4e7ed;">
      <el-button type="primary" @click="addRole">添加角色</el-button>
      <el-button type="primary" @click="openPermissionManager" style="margin-left: 10px;">管理权限</el-button>
    </el-header>

      <el-table :data="roles" style="width: 100%;min-height: 85%;">
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" width="250" />
        <el-table-column label="权限" min-width="300">
          <template #default="scope">
            <div class="permissions">
              <el-tag v-for="permission in scope.row.permissions" :key="permission.id" class="permission-tag">
                {{ permission.permissionName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="editRole(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRole(scope.row)" v-if="!(scope.row.id == 1 || scope.row.id == 2)">删除</el-button>
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

    <!-- Add/Edit Role Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '添加角色'" width="500px"  :close-on-click-modal="false" top="25vh">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.roleName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="权限">
          <el-select v-model="roleForm.permissions" multiple placeholder="选择权限">
            <el-option
              v-for="permission in allPermissions"
              :key="permission.id"
              :label="permission.permissionName"
              :value="permission.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Permission Manager Dialog -->
    <el-dialog v-model="permissionManagerVisible" title="管理权限" width="60%" :close-on-click-modal="false">
      <PermissionManager @saveSuccess="getAllPermissions"/>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionManagerVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from 'vue';
import { ElContainer, ElHeader, ElMain, ElButton, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTag, ElPagination } from 'element-plus';
import request from '@/config/request';
import { showSuccess, showError, showLoading, hideLoading } from '@/utils/utils';
import { ROLES_API, MENU_API } from '@/config/api';
import { useStore } from 'vuex';
import PermissionManager from './components/PermissionManager.vue';

const roles = ref([]);
const allPermissions = ref<any>([]);
const dialogVisible = ref(false);
const permissionManagerVisible = ref(false);
const store = useStore();
const isEdit = ref(false);
const roleForm = ref({
  id: '',
  roleName: '',
  description: '',
  permissions: [],
});
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const addRole = () => {
  isEdit.value = false;
  roleForm.value = {id:'', roleName: '', description: '', permissions: [] };
  dialogVisible.value = true;
};

const editRole = (row: any) => {
  isEdit.value = true;
  roleForm.value = {
    id: row.id,
    roleName: row.roleName,
    description: row.description,
    permissions: row.permissions.map((p: any) => p.id),
  };
  dialogVisible.value = true;
};

const deleteRole = async (row: any) => {
  // Implement delete logic here
  console.log('Delete role:', row);
  try {
    let response:any = await request({
      url: ROLES_API.DELETE_ROLES,
      method: 'get',
      params: {
        roleId: row.id,
      },
    })
    if (response.code === 200) {
      showSuccess('角色删除成功');
      getRoles();
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
    
  }
  
};

const saveRole = () => {
  if (roleForm.value.roleName === '') {
    showError('请输入角色名称');
    return;
  }
  if (roleForm.value.permissions.length === 0) {
    showError('请选择权限');
    return;
  }
  let params = {}
  if (isEdit.value) {
      params = {
        data: roleForm.value.permissions,
        params:{
          roleId:roleForm.value.id
        }
      }
  }else{
    params = {
      data:{
        roles:{
          roleName:roleForm.value.roleName,
          description:roleForm.value.description,
        },
        permissions:roleForm.value.permissions
      }
    }
  }
  request({
    url: isEdit.value ? ROLES_API.UPDATE_PERMISSION : ROLES_API.ADD_ROLES,
    method: 'post',
    ...params
  }).then((response: any) => {
    if (response.code === 200) {
      showSuccess('角色保存成功');
      dialogVisible.value = false;
      getRoles();
    } else {
      showError(response.message);
    }
  }).catch((error: any) => {
    showError(error.message);
  });
  dialogVisible.value = false;
};

const getUserPermission = inject('GET_USER_PERMISSION') as Function;

const getRoles = async (search?: boolean) => {
  try {
    showLoading();
    const response: any = await request({
      url: ROLES_API.GET_ALL_ROLES,
      method: 'get',
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
      },
      });

    if (response.code === 200) {
      roles.value = response.data.records;
      total.value = response.data.total;
      getUserPermission();
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

const getAllPermissions = async () => {
  try {
    showLoading();
    const response: any = await request({
      url: ROLES_API.GET_ALL_PERMISSIONS,
      method: 'get',
    });

    if (response.code === 200) {
      allPermissions.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    showError(error.message);
  } finally {
    hideLoading();
  }
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getRoles();
};

const openPermissionManager = () => {
  permissionManagerVisible.value = true;
};

onMounted(() => {
  getRoles();
  getAllPermissions();
});
</script>

<style lang="scss" scoped>
#roles {
  height: 100%;
  width: 100%;
  position: relative;

  .el-header {
    background-color: #f5f7fa;
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .permissions {
    display: flex;
    flex-wrap: wrap;
  }

  .permission-tag {
    margin: 2px;
  }
}
</style>