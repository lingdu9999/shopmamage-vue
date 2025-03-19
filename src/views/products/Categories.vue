<template>
  <el-container id="categories">
    <el-header>
      <el-button @click="openCategoryDetail(null)" type="primary" v-if="permissions.includes('ADD_CATEGORY')">增加分类</el-button>
      <el-button @click="deleteCategories" type="primary" v-if="permissions.includes('DELETE_CATEGORY')">删除分类</el-button>
      
      <el-input v-model.trim="searchCategoryName" placeholder="请输入分类名" style="width: 200px;margin-left: 20px;">
        <template #append>
          <span class="search-btn" @click="searchCategory">搜索</span>
        </template>
      </el-input>
    </el-header>
    <el-table :data="categories" @selection-change="selectionChange" max-height="calc(100vh - 250px)">
      <el-table-column type="selection" />
      <el-table-column prop="name" label="分类名" width="200"/>
      <el-table-column label="子类" width="600">
        <template #default="scope">
          <el-text>{{getSubCategories(scope.row)}}</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="500"/>
      <el-table-column label="操作" min-width="300" v-if="permissions.includes('UPDATE_CATEGORY') || permissions.includes('DELETE_CATEGORY')">
        <template #default="scope">
          <el-button type="primary" @click="openCategoryDetail(scope.row)" size="small" v-if="permissions.includes('UPDATE_CATEGORY')">编辑</el-button>
          <el-button type="danger" @click="deleteCategory([scope.row.categoryId])" size="small"  v-if="permissions.includes('DELETE_CATEGORY')">删除</el-button>
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
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, App,computed } from 'vue';
import { ElContainer, ElHeader, ElTable, ElButton, ElPagination } from 'element-plus';
import request from '@/config/request';
import { CATEGORY_API } from '@/config/api';
import { useStore } from 'vuex';
import { CategoryInfo } from '@/config/common';
import { showSuccess,showError,showDialog,closeDialog, showWarning,showLoading,hideLoading } from '@/utils/utils';
import addCategory from './components/addCategories.vue'
import { useRoute, useRouter } from 'vue-router';


let categories = ref([]); // 存储分类列表
const currentPage = ref(1); // 当前页码
const pageSize = ref(12); // 每页显示的分类数量
const total = ref(0); // 分类总数

const store = useStore();

const permissions = computed(() => store.state.permissionList);

const searchCategoryName = ref<string>('');
const selectCategoryList = ref<CategoryInfo[]>([]);

const selectionChange = (selection:CategoryInfo[]) => {
  
  selectCategoryList.value = selection.filter(item=>item.parentId==null);
}


const getSubCategories = (row:any)=>{
  return row.children.map((item:any)=>item.name).join('，');
}

const searchCategory = async () => {
  getCategories(true);
}

const openCategoryDetail = async (category:CategoryInfo | null) => {
  // 打开分类详情对话框的逻辑
  try {
    let res:any = await showDialog({
      title : category?'编辑分类':'添加分类',
      visible : true,
      footer: false,
      width: '500px',
      slots: {
        content: {
          component: addCategory,
          props: {
            categoryData: JSON.parse(JSON.stringify(category)),
          }
        }
      }
    })
    closeDialog(res as App<Element>);
    addOrUpdateCategories(res.data);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }
}

const addOrUpdateCategories = async (category:CategoryInfo) => {
  try {
    showLoading();
    const res:any = await request({
      url: category.categoryId ? CATEGORY_API.UPDATE_CATEGORY : CATEGORY_API.ADD_CATEGORY,
      method:'POST',
      data:category
    })

    if(res.code == 200){
      showSuccess('操作成功');
      searchCategoryName.value = ''
      getCategories();
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    showError(error);
  }finally{
    hideLoading();
  }
}

const deleteCategories = async () => {
  if (selectCategoryList.value.length == 0) {
    showWarning("请选择要删除的分类");
    return;
  }
  console.log(selectCategoryList.value);
  
  let categoryIds = selectCategoryList.value.map(category => category.categoryId);
  deleteCategory(categoryIds as number[]);
}

const deleteCategory = async (categoryIds:number[]) =>{
  try{
    let res = await showDialog({
      title : '提示',
      visible : true,
      width: '300px',
      slots: {
        default: '确定要删除选中的分类吗',
      }
    })
    closeDialog(res as App<Element>);
  }catch(error){
    closeDialog(error as App<Element>);
    return;
  }

  showLoading();
  try {
    let res:any = await request({
      url: CATEGORY_API.DELETE_CATEGORY,
      method:'POST',
      data:categoryIds
    })
    if (res.code === 200) {
      showSuccess(res.message);
      getCategories();
    }else{
      showError(res.message);
    }
  } catch (error:any) {
    showError(error.message);
  }finally{
    selectCategoryList.value = []
    hideLoading();
  }
}

const getCategories = async (search = false) => {
  try {
    showLoading();
    const response:any = await request({
      url: CATEGORY_API.GET_ALL_CATEGORY, 
      method: 'get',
      params: {
        pageNum: search ? 1 : currentPage.value,
        pageSize: pageSize.value,
        name: searchCategoryName.value,
      }
    });

    if (response.code == 200) {
      categories.value = response.data.records;
      total.value = response.data.total;
      currentPage.value = response.data.current;
      pageSize.value = response.data.pageSize;
    }else{
      showError(response.message);
    }
  } catch (error:any) {
    showError(error);
  }finally{
    hideLoading();
  }
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  getCategories();
};
const route = useRoute();
const router = useRouter();

onMounted(()=>{
  
  let routeName = router.currentRoute.value.path;
  setTimeout(() => {
    if (route.path === routeName) {
      getCategories();
    }
  });
}); // 组件挂载后获取分类数据
</script>

<style lang="scss" scoped>
#categories {
  height: 100%;
  width: 100%;
  position: relative;
  .el-header {
    background-color: #f5f7fa;
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-table {
    min-height: calc(100vh - 250px);
    overflow-y: auto;
  }
  .el-button {
    margin-left: 10px;
  }
  .search-btn {
    cursor: pointer;
  }
}
</style> 

  