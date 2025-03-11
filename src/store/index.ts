import { createStore } from 'vuex'
import { InjectionKey } from 'vue'
import { Store } from 'vuex'
import { Base64 } from 'js-base64';

// 定义 UserInfo 接口
export interface UserInfo {
  userId: number;
  username: string;
  token: string;
  [key: string]: any; // 允许其他字段
}

// 定义 State 接口
export interface State {
  token: string | null;
  userInfo: UserInfo | null;
  menu:MenuItem[]
}

interface MenuItem {
  label: string;
  icon: string | null;
  path: string | null;
  children: MenuItem[];
}

// 创建 injection key
const key: InjectionKey<Store<State>> = Symbol()

function vaildateUser(){
  const Exp = /^\{.*\}$/;

  try{
    return JSON.parse(Base64.decode(sessionStorage.getItem('userInfo') as string)) as UserInfo
  }catch(e){
    return null
  }
}

// 创建 store
export default createStore<State>({
  state: {
    token: vaildateUser()?.token || null,
    userInfo: vaildateUser(),
    menu: []
  },
  mutations: {
    SET_MENU(state,menuList:MenuItem[]){
      state.menu = JSON.parse(JSON.stringify(menuList))
    },
    SET_TOKEN(state, userInfo: UserInfo) {
      
      state.token = userInfo.token
      state.userInfo = JSON.parse(JSON.stringify(userInfo))
      
      sessionStorage.setItem('userInfo', Base64.encode(JSON.stringify(userInfo)))

      sessionStorage.setItem('token', userInfo.token)
    },
    CLEAR_USER_STATE(state) {
      state.token = null
      state.userInfo = null
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('userInfo')
    }
  }
}) 