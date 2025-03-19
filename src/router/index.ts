import path from 'path';
import { createMemoryHistory, createRouter,createWebHashHistory } from 'vue-router';
import { showError} from '@/utils/utils';
import { useStore } from 'vuex';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';
import { log } from 'echarts/types/src/util/log.js';

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
    redirect:'orders/stats',
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
        path:'/orders',
        meta:{
          title:'订单管理'
        },
        children:[
          {
            path:'orders',
            name:'orders',
            component: ()=> import('@/views/orders/Orders.vue'),
            meta:{
              title:'订单列表'
            }
          },
          {
            path:'stats',
            name:'stats',
            component: ()=> import('@/views/orders/OrdersStats.vue'),
            meta:{
              title:'订单统计'
            }
          },
        ]
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
          },
          {
            path:'activity',
            name:'activity',
            component:()=>import('@/views/setting/UserActivity.vue'),
            meta:{
              title:'用户行为'
            },
          }
        ]
      }
    ]
  },
  {
    path: '/403',
    name: 'Error403',
    component: () => import('@/views/Error403.vue'),
    meta: {
      title: '403 - Forbidden'
    }
  }
];



const router = createRouter({
    history: createWebHashHistory(),
    routes
})


router.beforeEach((to, from, next) => {

  const store = useStore()
  if (to.path === '/login') {
    next();
    return;
  }
  
  const token = store.state.token;
  if (to.path !== '/login' && !token) {
    store.dispatch('CLEAR_USER_STATE');
    next('/login');
    return;
  } 
  let permissionList = store.state.permissionUrl.map((item:any) => item.pageUrl);
  if (!permissionList.includes(to.path) && to.path !== '/index/home' && to.path !== '/login' && to.path !== '/403') {
    next('/403');
    return;
  }
  next();
})

export default router
