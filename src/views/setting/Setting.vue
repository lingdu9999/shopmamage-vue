<template>
  <div class="setting-container">
    <div class="edit-account">
      <el-card v-if="currentModule === 'view'" class="account-card">
        <h2>账户信息</h2>
        <div class="avatar-container">
          <el-avatar :src="FILE_URL + account.image" :size="150" />
        </div>
        <div class="info-container">
          <div class="info-item">
            <span class="label">用户名:</span>
            <span>{{ account.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱:</span>
            <span>{{ account.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">电话:</span>
            <span>{{ account.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色:</span>
            <span>{{ account.role === 0 ? '管理员' : '员工' }}</span>
          </div>
          <div class="info-item">
            <span class="label">个性签名:</span>
            <span>{{ account.message }}</span>
          </div>
        </div>
        <div class="button-container">
          <el-button type="primary" @click="switchModule('edit')">编辑信息</el-button>
          <el-button type="warning" @click="switchModule('changePassword')">修改密码</el-button>
        </div>
      </el-card>

      <el-card v-if="currentModule === 'edit'" class="account-card">
        <h2>编辑基本信息</h2>
        <el-form label-width="120px" @submit.prevent="saveAccount">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              :action="FILE_URL+'/upload'" 
              :show-file-list="false"
              :on-success="handleAvatarChange"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="account.image" :src="FILE_URL + account.image" class="avatar">
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="account.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="account.email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="account.phone"></el-input>
          </el-form-item>
          <el-form-item label="个性签名">
            <el-input type="textarea" v-model="account.message"></el-input>
          </el-form-item>
          <div class="button-container">
            <el-button type="primary" @click="saveAccount">保存</el-button>
            <el-button @click="switchModule('view')">取消</el-button>
          </div>
        </el-form>
      </el-card>

      <el-card v-if="currentModule === 'changePassword'" class="account-card">
        <h2>修改密码</h2>
        <el-form label-width="120px" @submit.prevent="changePassword">
          <el-form-item label="当前密码">
            <el-input type="password" v-model="passwords.oldPassword"></el-input>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input type="password" v-model="passwords.newPassword"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input type="password" v-model="passwords.confirm"></el-input>
          </el-form-item>
          <div class="button-container">
            <el-button type="primary" @click="changePassword">修改</el-button>
            <el-button @click="switchModule('view')">取消</el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed,onMounted } from 'vue';
import { UserInfo } from '@/config/common';
import { showLoading,hideLoading,showError,showWarning,showSuccess } from '@/utils/utils';
import { FILE_URL,USER_API } from '@/config/api';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue'
import  request  from '@/config/request';

const store = useStore();

const currentModule = ref('view');

const account = ref('');

const passwords = reactive({
  oldPassword: '',
  newPassword: '',
  confirm: ''
});
const getUser = async () =>{
  try{
    showLoading();
    const res:any = await request({
      url: USER_API.GET_USER + '/' + store.state.userInfo.userId,
      method: 'get'
    });
    if(res.code == 200){
      account.value = res.data;
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    showError(error)
  }finally{
    hideLoading();
  }
}

onMounted(() => {
  console.log(123);
  
  getUser();
});

const switchModule = (module: string) => {
  
  currentModule.value = module;
};

const saveAccount = async () => {
  // 保存账号信息的逻辑
  try{
    const res:any = await request({
      url: USER_API.UPDATE_USER_URL,
      method: 'post',
      data: account.value
    });
    if(res.code == 200){
      showSuccess('操作成功');
      getUser();
      switchModule('view');
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    showError(error)
  }
};

const changePassword = async () => {
  // 修改密码的逻辑
  if (passwords.newPassword === passwords.confirm) {
    try {
      let res:any = await request({
        url: USER_API.UPDATE_PASSWORD,
        method: 'post',
        data:{
          userId: store.state.userInfo.userId,
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword
        }
      })
      if (res.code === 200) {
        showSuccess('密码已修改,请重新登录');
        store.commit('CLEAR_USER_STATE');
        setTimeout(() => {
          window.location.href = '/#/login';
        }, 1000);
      }else{
        showError(res.message);
      }
    } catch (error:any) {
      showError(error)
    }
  } else {
    showError('新密码和确认密码不匹配');
  }
};

const beforeAvatarUpload = (file: any) => {
  let typeList = ['image/jpeg','image/png','image/jpg'];
  if (!typeList.includes(file.type)) {
    showError('头像必须是JPG、PNG、JPEG格式!')
    return false
  } else if (file.size / 1024 / 1024 > 2) {
    showError('头像不能超过2MB!')
    return false
  }
  return true
};

const handleAvatarChange = (res:any) => {
  if (res.code === 200) {
    account.value.image ='/image/' + res.data;
  }else{
    showError(res.message);
  }
};
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 0 20px 20px;
  height: 100%;
  overflow: hidden;
  .edit-account {
    height: calc(100%);
    overflow-y: auto;
    background:#324157;

    .account-card {
      max-height:calc(100% - 20px);
      :deep(.el-card__body) {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center; /* Center horizontally */
        text-align: center; /* Center text within items */
      }
    }

    .avatar-container {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .info-container {
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      margin: 5px 0;
      .label {
        width: 80px;
        padding-right: 10px;
        text-align: right;
      }
    }

    .button-container {
      margin-top: auto;
      display: flex;
      justify-content: center; /* Center buttons horizontally */

      .el-button {
        margin-left: 10px;
      }
    }

    .avatar-uploader {
      :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
      }

      :deep(.el-upload:hover) {
        border-color: var(--el-color-primary);
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c9398;
        width: 178px;
        height: 178px;
        text-align: center;
      }

      .avatar {
        width: 178px;
        height: 178px;
        display: block;
      }
    }
  }
}
</style>

