export const BASE_URL = 'http://localhost:3000';
export const FILE_URL = 'http://localhost:8081';

export const REGISTER_URL = '/register';
export const LOGIN_URL = '/login';

export const MENU_API  = {
  MENU_URL: '/menu/getAll',
  GET_ALL_MENU: '/menu/page',
  GET_MENU_LIST:'/menu/getList',
  GET_PARENT:'/menu/parents',
  ADD_MENU:'/menu/add',
  UPDATE_MENU:'/menu/update',
  DELETE_MENU:'/menu/delete',
  SET_MENU_STATUS:'/menu/status',
}

export const USER_API = {
  GET_ALL_USERS_URL : '/users/getAll',
  UPDATE_USER_URL : '/users/update',
  DELETE_USER_URL : '/users/delete',
  DISABLE_STATUS_URL : '/users/disabled',
  SEARCH_USER_URL : '/users/search',
  GET_USER : '/users/getUserById',
  GET_USER_ACTIVITIES : '/users/activities',
  UPDATE_PASSWORD : '/users/updatePassword'
}

export const CATEGORY_API = {
  GET_ALL_CATEGORY: '/category/getAll',
  LIST_CATEGORY: '/category/list',
  SUBLIST_CATEGORY: '/category/sublist',
  GET_PARENT_CATEGORY: '/category/getParentId',
  ADD_CATEGORY: '/category/add',
  UPDATE_CATEGORY: '/category/update',
  DELETE_CATEGORY:'/category/delete'
}

export const PRODUCT_API = {
  GET_ALL_PRODUCTS: '/products/getAll',
  UPDATE_PRODUCT: '/products/update',
  DELETE_PRODUCT: '/products/delete',
  ADD_PRODUCT: '/products/add',
  AUDIT_PRODUCT: '/products/audit',
  GET_PRODUCT_DETAIL: '/products/getProductById',
  GET_PRODUCT_BY_CATEGORY: '/products/getByCategory',
}

export const ORDER_API = {
  GET_ALL_ORDERS: '/orders/getAll',
  UPDATE_ORDER: '/orders/update',
  DELETE_ORDER: '/orders/delete',
  ADD_ORDER: '/orders/add',
  GET_ORDER_DETAILS: '/orders/detail',
  UPDATE_ORDER_STATUS: '/orders/status',
}

export const ROLES_API = {
  GET_ALL_ROLES: '/roles/getAll',
  GET_ALL_PERMISSIONS: '/permissions/getAll',
  ADD_PERMISSION: '/permissions/add',
  UPDATE_PERMISSION: '/roles/updatePermissions',
  DELETE_PERMISSION: '/permissions/delete',
  ADD_ROLES:'/roles/add',
  DELETE_ROLES:'/roles/delete',
}

export const STATISTICS_API = {
  GET_ECHARTS_DATA: '/statistics/echarts'
}
