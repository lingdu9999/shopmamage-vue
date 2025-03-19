<template>
    <div id="login" class="flex-col justify-start page">
        <div class="flex-col justify-start items-center section">
        <div class="flex-row section_2">
            <div class="flex-col shrink-0 section_3">
            <div class="flex-row items-center self-stretch">
                <img
                class="image"
                src="../assets/app_icon.ico"
                />
                <!-- <span class="text_2 ml-21">Ma ZeYing</span> -->
            </div>
            <div class="flex-col items-start self-stretch group_2">
                <span class="font_2 text_4">电商平台</span>
                <span class="font_2 text_4 mt-9">后台管理系统</span>
            </div>
            <span class="self-start text_10">Ma ZeYing</span>
            </div>
            <div class="flex-col shrink-0 section_4">
            <!-- <span class="self-center text">登录</span> -->
            <div class="flex-col self-stretch group">
                <span class="self-start font text_3">账号</span>
                <ElInput type="text" class="text-wrapper" placeholder="请输入" v-model="userInfo.username"/>
                <span class="self-start font text_6">密码</span>
                <ElInput class="text-wrapper" placeholder="请输入" v-model="userInfo.password" type="password"/>
                <div class="flex-row items-center self-stretch group_3">
                  <ElCheckbox v-model="userInfo.remember" label="记住密码" class="group_4" />
                </div>
            </div>
            <div class="flex-col justify-start items-center self-stretch text-wrapper_3" @click="login">
                <span class="text_9">登入</span>
            </div>
            <div class="flex-col justify-start items-center self-stretch text-wrapper_3" v-if="false">
                <span class="text_9">注册</span>
            </div>
            </div>
        </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ElCheckbox, ElInput,ElLoading, ElMessage } from 'element-plus';
import { functions, isEmpty } from 'lodash';
import { onMounted, reactive,provide } from 'vue';
import request from '@/config/request';
import  router  from '@/router';
import {setCookie,getCookie,showLoading, hideLoading, showSuccess, showWarning, showError} from '@/utils/utils';
import { useStore } from 'vuex'
import { LOGIN_URL } from '@/config/api';
import { ca } from 'element-plus/es/locale/index.mjs';
const userInfo = reactive({
  username:'',
  password:'',
  remember:false
})

// 在setup中获取store实例
const store = useStore()

onMounted(()=>{
  
  let username = localStorage.getItem('username') as string
  let password = localStorage.getItem('password') as string
  if(Number(username) !== 0 && Number(password) !== 0){
    userInfo.username = username
    userInfo.password = password
    userInfo.remember = true
  }
})

async function login(){
  // 验证用户名
  if (isEmpty(userInfo.username)) {
    showWarning('请输入用户名')
    return
  }
  
  // 验证密码
  if (isEmpty(userInfo.password)) {
    showWarning('请输入密码')
    return
  }
  
  showLoading('Loging...')
  
  try {
    let res:any = await request({
      url:LOGIN_URL,
      method:'post',
      responseType:'json',
      data:{
        username:userInfo.username,
        password:userInfo.password
      },
    })
    
    if (res.code == 200) {
      showSuccess('登录成功')
      
      getUserPermission();
      if (userInfo.remember) {
        localStorage.setItem('username',userInfo.username)
        localStorage.setItem('password',userInfo.password)
      }else{
        localStorage.removeItem('username')
        localStorage.removeItem('password')
      }
      
      if (res.data?.token) {
        store.dispatch('setToken', res.data)
      }
      setTimeout(() => {
        router.push('/index')
      }, 0);
    } else {
      store.dispatch('clearUserState')
      showError(res.message || '密码错误')
    }
  } catch (error:any) {
    store.dispatch('clearUserState')
    showError(error)
  } finally {
    hideLoading()
  }
}


async function getUserPermission() {
  try {
    let res:any = await request({
      url: '/permissions/getByUser',
      method: 'get',
    })

    if (res.code === 200) {
      let permission = res.data.map((item:any) => item.permissionCode)
      store.dispatch('setPermission', permission)
      store.dispatch('setPermissionUrl', res.data)
    } else {
      showError(res.message)
    }
  }catch (error:any) {
    showError(error)
  }
}

provide('GET_USER_PERMISSION', getUserPermission as Function);

</script>

<style scoped lang="scss">
#login{
    height: 100%;
}
.ml-21 {
  margin-left: 21px;
}
.mt-9 {
  margin-top: 9px;
}
.page {
  background-color: #458af6;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  .section {
    width: 100%;
    height: 100%;
    position: relative;
    .section_2 {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      box-shadow:1px 1px 1px #292929;
      .section_3 {
        padding: 101px 72px 70px;
        background-color: #3f7cdd;
        height: 696px;
        .image {
          width: 80px;
          height: 80px;
        }
        .text_2 {
          color: #ffffff;
          font-size: 36px;
          font-family: AlibabaPuHuiTi;
          font-weight: 700;
          line-height: 33px;
        }
        .group_2 {
          margin-top: 48px;
          padding: 0 4px;
          .font_2 {
            font-size: 50px;
            font-family: AlibabaPuHuiTi;
            line-height: 60px;
            font-weight: 700;
            color: #ffffff;
          }
          .text_4 {
            text-transform: uppercase;
          }
        }
        .text_10 {
          margin-top: 244px;
          color: #ffffff;
          font-size: 20px;
          font-family: AlibabaPuHuiTi;
          line-height: 24px;
          text-align: center;
          text-transform: uppercase;
          width: 110px;
        }
      }
      .section_4 {
        padding: 84px 68px 129px;
        background-color: #ffffff;
        height: 696px;
        .text {
          color: #292929;
          font-size: 40px;
          font-family: AlibabaPuHuiTi;
          font-weight: 700;
          line-height: 37.5px;
        }
        .group {
          margin-top: 60px;
          .font {
            font-size: 24px;
            font-family: AlibabaPuHuiTi;
            line-height: 22px;
            color: #969696;
          }
          .text_3 {
            line-height: 21.5px;
          }
          .text-wrapper {
            margin-top: 18px;
            background-color: #eeeeee;
            width: 418px;
            height: 48px;

            ::v-deep .el-input__wrapper{
              width: 100%;
            }
          }
          
          .text_6 {
            margin-top: 15px;
          }
          .group_3 {
            padding-top: 16px;
            .group_4 {
              font-size: 15px;
            }
            .text_8 {
              color: #969696;
              font-size: 14px;
              font-family: AlibabaPuHuiTi;
              line-height: 13px;
            }
          }
        }
        .text-wrapper_3 {
          margin-top: 30px;
          padding: 18px 0;
          background-color: #458af6;
          width: 418px;
          cursor: pointer;;
          .text_9 {
            color: #ffffff;
            font-size: 28px;
            font-family: AlibabaPuHuiTi;
            line-height: 25px;
          }
        }
      }
      .text-wrapper_3:nth-of-type(3){
        background-color: #ff7b00;
          .text_9 {
            color: #000000;
            font-size: 28px;
            font-family: AlibabaPuHuiTi;
            line-height: 25px;
          }
      }
    }
  }
}
</style>