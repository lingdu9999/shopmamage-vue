import path from 'path';
import { createMemoryHistory, createRouter,createWebHashHistory } from 'vue-router';
import { showError} from '@/utils/utils';
import { useStore } from 'vuex';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';

const routes = [
  {
    path:'/',
    redirect:'/index/home',
    meta:{
      title:'首页'
    }
  },
  { 
    path: '/login',
    name:'login',
    component:  () => import('@/components/Login.vue'),
    meta:{
      title:'登录'
    }
  },
  {
    path:'/index',
    name:'index',
    component: ()=> import('@/components/shopManageIndex.vue'),
    redirect:'index/home',
    meta:{
      title:'首页'
    },
    children:[
      {
        path:'home',
        name:'home',
        component: ()=> import('@/views/Home.vue'),
        meta:{
          title:'首页'
        }
      },
      {
        path:'/orders/orders',
        component: ()=> import('@/views/orders/Orders.vue'),
        meta:{
          title:'订单管理'
        }
      },
      {
        path:'/users',
        meta:{
          title:'用户管理'
        },
        children:[
          {
            path:'users',
            name:'users',
            component: ()=> import('@/views/users/Users.vue'),
            meta:{
              title:'用户列表'
            },
          },
          {
            path:'roles',
            name:'roles',
            component: ()=> import('@/views/users/Roles.vue'),
            meta:{
              title:'权限管理'
            }
          },
        ]
      },
      {
        path:'/products',
        meta:{
          title:'产品管理'
        },
        children:[
          {
            path:'products',
            name:'products',
            component: ()=> import('@/views/products/Products.vue'),
          },{
          path:'categories',
          name:'categories',
          component: ()=> import('@/views/products/Categories.vue'),
          meta:{
            title:'分类管理'
          }
        }]
      },
      {
        path:'/setting',
        meta:{
          title:'系统设置'
        },
        children:[
          {
            path:'setting',
            name:'setting',
            component: ()=> import('@/views/setting/Setting.vue'),
            meta:{
              title:'账户设置'
            },
          },
          {
            path:'menu',
            name:'menu',
            component:()=>import('@/views/setting/Menu.vue'),
            meta:{
              title:'菜单管理'
            },
          }
        ]
      }
    ]
  }
];



const router = createRouter({
    history: createWebHashHistory(),
    routes
})


router.beforeEach((to, from, next) => {

  const store = useStore()
  
  // 获取localStorage中存储的token
  const token = store.state.token
  // 如果要访问的不是登录页且没有token，则重定向到登录页
  if (to.path !== '/login' && !token) {
    store.commit('CLEAR_USER_STATE')
    next('/login')
  } else {
    next()
  }
})

export default router
