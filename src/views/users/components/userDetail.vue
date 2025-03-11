<template>
  <!-- <el-dialog v-model="Visible" :title="userForm?.userId ? '用户详情' : '添加用户'" :show-close="false" :close-on-press-escape="false" :close-on-click-modal="false"  width="500px"> -->
    <el-form :model="userForm" ref="userFormRef" label-width="100px" :rules="userRole">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!userForm?.userId">
        <el-input v-model="userForm.password" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email" >
        <el-input v-model="userForm.email" style="width: 300px;"  />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="userForm.phone" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="角色" prop="role" >
        <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 300px;" :disabled="getUserRole!=0">
          <el-option label="管理员" :value="0" />
          <el-option label="员工" :value="1" />
          <el-option label="用户" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="个性签名" prop="message">
        <el-input v-model="userForm.message" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" maxlength="100" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="头像" prop="image">
        <el-upload
          class="avatar-uploader"
          :action="FILE_URL+'/upload'"
          :show-file-list="false"
          :on-success="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="userForm.image" :src="FILE_URL+userForm.image" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <div style="text-align: right;">
      <el-button type="primary" @click="submitForm">确定</el-button>
      <el-button @click="resetForm">取消</el-button>
    </div>
  <!-- </el-dialog> -->
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onUnmounted,computed } from 'vue';
import { FormRules,FormInstance,ElButton,ElForm,ElFormItem,ElInput,ElSelect,ElOption,ElUpload,ElIcon } from 'element-plus';
import { UserInfo } from '@/config/common';
import { FILE_URL } from '@/config/api';
import { showError } from '@/utils/utils';
import store  from '@/store';
import { Plus } from '@element-plus/icons-vue';

const props = defineProps<{
  userData: UserInfo | null;
  s: (data?:any) => void;
  e: (data?:any) => void;
}>();

const userFormRef = ref<FormInstance>();

const getUserRole = computed(()=>{
  return store.state.userInfo?.role;
});

const userForm = ref<UserInfo>({
  username: '',
  email: '',
  phone: '',
  role: 0,
  image: '',
  message: '',
  issuse: 1
});

const userRole = reactive<FormRules<UserInfo>>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  email: [{ required: true, pattern:'^[A-Za-z0-9+_.-]+@(.+)$', message: '请正确输入邮箱', trigger: 'blur' }],
  phone: [{ required: true,pattern:'^1[3-9]\\d{9}$', message: '请正确输入电话', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  image: [{ required: true, message: '请上传头像', trigger: 'change' }]
});

onMounted(()=>{
  console.log(store);
  
  
  userFormRef.value?.resetFields();
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    role: 0,
    image: '',
    message: '',
    issuse: 1
  };
  if(props.userData){
    userForm.value = props.userData;
  }
})

onUnmounted(()=>{
  console.log('unmounted');
})


const resetForm = () => {
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    role: 0,
    image: '',
    message: '',
    issuse: 1
  };
  props.e();
};

const submitForm = () => {
  userFormRef.value?.validate((valid) => {
    if (valid) {
      if(userForm.value.image === ''){
        showError('请上传头像');
        return;
      }
      let user = JSON.parse(JSON.stringify(userForm.value));
      props.s(user);
    }
  });
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
    userForm.value.image ='/image/' + res.data;
  }else{
    showError(res.message);
  }
};
</script>

<style scoped>
.avatar-uploader {
  display: inline-block;
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.avatar{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>

