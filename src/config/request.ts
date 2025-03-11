import axios from 'axios'
import router from '@/router'
import { showSuccess, showWarning, showError} from '@/utils/utils';
import { BASE_URL } from './api.ts';
import { useStore } from 'vuex';


interface Result<T = any>{
  code:number,
  data:T,
  date:string,
  message:string
}


// 创建axios实例
const service = axios.create({
  baseURL: BASE_URL as string,  // API基础路径
  timeout: 5000  // 请求超时时间
})



// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token')
    if (token) {
      // 将token添加到Authorization请求头
      config.headers['Authorization'] = 'Bearer '+token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    
    const res = response.data
    // 这里可以根据后端的响应格式进行相应的处理
    if ((res.code === 401 && !response.config.url?.includes('login'))) {
      showError(res.message)
      // token失效，清除token并跳转到登录页
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
      setTimeout(() => {
        router.push('/login')
      }, 0);
    }
    return res
  },
  error => {
    if (error.response?.status === 401) {
      // token失效，清除token并跳转到登录页
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default service
