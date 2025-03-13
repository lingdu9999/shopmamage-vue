<template>
  <el-container id="products">
    <el-header>
      <el-button @click="openProductDetail('add',null)" type="primary" v-if="permissions.includes('ADD_PRODUCT')">增加产品</el-button>
      <el-button @click="deleteProducts" type="primary" v-if="permissions.includes('DELETE_PRODUCT')">删除产品</el-button>
      
      <el-select v-model="selectCategory" style="width: 200px;margin-left: 20px;" clearable placeholder="选择分类">
        <el-option
          v-for="item in categories"
          :key="item.categoryId"
          :label="item.name"
          :value="item.categoryId"
        />
      </el-select>
      <el-select v-model="selectStatus" style="width: 120px; margin-left: 20px;" clearable placeholder="选择状态">
        <el-option label="上架" :value="1" />
        <el-option label="审核中" :value="2" />
        <el-option label="下架" :value="3" />
      </el-select>
      <el-input v-model.trim="searchProductName" placeholder="请输入产品名" style="width: 200px;margin-left: 20px;">
        <template #append>
          <span class="search-btn" @click="searchProduct">搜索</span>
        </template>
      </el-input>
    </el-header>
    <el-table :data="products" @selection-change="selectionChange" max-height="calc(100vh - 250px)">
      <el-table-column type="selection" :selectable="selectable"/>
      <el-table-column prop="sku" label="SKU" width="150"/>
      <el-table-column prop="name" label="产品名" width="150"/>
      <el-table-column prop="mainImage" label="主图" width="100">
        <template #default="scope">
          <el-image :src="FILE_URL + scope.row.mainImage" style="width: 50px; height: 50px;" />
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" width="200"/>
      <el-table-column prop="price" label="价格" width="150"/>
      <el-table-column prop="stock" label="库存" width="80"/>
      <el-table-column prop="productionDate" label="生产日期" width="150"/>
      <el-table-column prop="shelfDays" label="质保天数" width="150">
        <template #default="scope">
          <el-text>
            {{ getShelfDays(scope.row) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="400"/>
      <el-table-column prop="status" label="状态" min-width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'primary' : 'danger'">
            {{ scope.row.status === 1 ? '上架' : scope.row.status === 2 ? '审核' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="300">
        <template #default="scope">
          <el-button  @click="openProductDetail('view',scope.row)" size="small">详情</el-button>
          <el-button type="primary" @click="openProductDetail('edit',scope.row)" size="small" v-if="permissions.includes('UPDATE_PRODUCT')">编辑</el-button>
          <template v-if="permissions.includes('AUDIT_PRODUCT') || permissions.includes('UPDATE_PRODUCT')">
            <el-button
              v-if="scope.row.status === 2"
              type="warning"
              @click="openApprovalDialog(scope.row)"
              size="small"
            >
              审核
            </el-button>
            <el-button
              v-if="scope.row.status === 1"
              type="info"
              @click="changeProductStatus(scope.row, 3,null)"
              size="small"
            >
              下架
            </el-button>
            <el-button
              v-if="scope.row.status === 3"
              type="success"
              @click="changeProductStatus(scope.row, 1,null)"
              size="small"
            >
              上架
            </el-button>
          </template>
          <el-button type="danger" @click="deleteProduct([scope.row.productId])" size="small"  v-if="permissions.includes('DELETE_PRODUCT')">删除</el-button>
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
import { ElContainer, ElHeader, ElTable, ElButton, ElPagination, ElSelect, ElOption } from 'element-plus';
import request from '@/config/request';
import { PRODUCT_API, CATEGORY_API } from '@/config/api';
import {FILE_URL} from '@/config/api'
import { useStore } from 'vuex';
import { showSuccess, showError, showDialog, closeDialog, showWarning, showLoading, hideLoading } from '@/utils/utils';
import ProductDetail from './components/productsDetail.vue';
import setProductStatus from './components/setProductStatus.vue';

let products = ref([]); // 存储产品列表
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的产品数量
const total = ref(0); // 产品总数
const store = useStore();

const permissions = computed(() => store.state.permissionList);


const searchProductName = ref<string>('');
const selectProductList = ref<any[]>([]);
const selectCategory = ref<number[]>([]);
const selectStatus = ref<number|string>('');
const categories = ref<{
  categoryId: number;
  name: string;
}[]>([]);

const getShelfDays = (row: any) => {
  const productionDate = new Date(row.productionDate); // Convert to Date object
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - productionDate.getTime(); // Get time difference in milliseconds
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days
  if (Number(row.shelfDays) === 0) {
    return '无'
  }else if(daysDifference > row.shelfDays){
    return row.shelfDays + '（已过期）'
  }else{
    return row.shelfDays ; // Return the number of days
  }
}

const selectionChange = (selection:any) => {
  selectProductList.value = selection;
}

const selectable = (row:any) => {
  return true; // 所有行都可以选择
}

const searchProduct = async () => {
  getProducts(true);
}

const openProductDetail = async (type:string,product:any) => {
  // 打开产品详情对话框的逻辑
  try {
    let res:any = await showDialog({
      title: type === 'view' ? '查看商品' : type === 'add' ? '添加商品' : '编辑商品',
      visible: true,
      footer: false,
      width: '1000px',
      slots: {
        content: {
          component: ProductDetail,
          props: {
            productData: JSON.parse(JSON.stringify(product)),
            mode:type
          }
        }
      }
    });
    closeDialog(res as App<Element>);
    addOrUpdateProducts(res.data);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }
}

const addOrUpdateProducts = async (product:any) => {
  
  try {
    showLoading();
    const res:any = await request({
      url: product.productId ? PRODUCT_API.UPDATE_PRODUCT : PRODUCT_API.ADD_PRODUCT,
      method: 'POST',
      data: product
    });

    if (res.code == 200) {
      showSuccess('操作成功');
      searchProductName.value = '';
      selectCategory.value = [];
      getProducts();
    } else {
      showError(res.message);
    }
  } catch (error:any) {
    showError(error);
  } finally {
    hideLoading();
  }
}

const deleteProducts = async () => {
  if (selectProductList.value.length == 0) {
    showWarning("请选择要删除的产品");
    return;
  }
  let productIds = selectProductList.value.map(product => product.productId);
  deleteProduct(productIds);
}

const deleteProduct = async (productIds:any) => {
  try {
    let res = await showDialog({
      title: '提示',
      visible: true,
      width: '300px',
      slots: {
        default: '确定要删除选中的产品吗',
      }
    });
    closeDialog(res as App<Element>);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }

  showLoading();
  try {
    let res:any = await request({
      url: PRODUCT_API.DELETE_PRODUCT,
      method: 'POST',
      data: productIds
    });
    if (res.code === 200) {
      showSuccess(res.message);
      getProducts();
    } else {
      showError(res.message);
    }
  } catch (error:any) {
    showError(error.message);
  } finally {
    selectProductList.value = [];
    hideLoading();
  }
}

const getProducts = async (search = false) => {
  try {
    showLoading();
    const response:any = await request({
      url: PRODUCT_API.GET_ALL_PRODUCTS,
      method: 'get',
      params: {
        pageNum: search ? 1 : currentPage.value,
        pageSize: pageSize.value,
        name: searchProductName.value,
        categoryId: selectCategory.value,
        status: selectStatus.value
      }
    });

    if (response.code == 200) {
      products.value = response.data.records;
      total.value = response.data.total;
      currentPage.value = response.data.current;
      pageSize.value = response.data.pageSize;
    } else {
      showError(response.message);
    }
  } catch (error:any) {
    showError(error);
  } finally {
    hideLoading();
  }
};

const getCategories = async () => {
  try {
    const response:any = await request({
      url: CATEGORY_API.SUBLIST_CATEGORY,
      method: 'get',
    });

    if (response.code == 200) {
      categories.value = response.data;
    } else {
      showError(response.message);
    }
  } catch (error:any) {
    showError(error);
  } 
};

const handleCurrentChange = (page:number) => {
  currentPage.value = page;
  getProducts();
};

const changeProductStatus = async (row: any, status: any, type:any) => {
  console.log(status);
  
  if (type != 2) {
    try {
      let res = await showDialog({
        title: '提示',
        visible: true,
        width: '300px',
        slots: {
          default: `确定要${status === 1 ? '上架' : '下架'}该产品吗？`,
        },
      });
      closeDialog(res as App<Element>);
    } catch (error) {
      closeDialog(error as App<Element>);
      return;
    }
  }

  try {
    showLoading();
    const res: any = await request({
      url: PRODUCT_API.AUDIT_PRODUCT,
      method: 'POST',
      params: {
        id: row.productId,
        status: status,
        type: type
      },
    });

    if (res.code === 200) {
      showSuccess('操作成功');
      getProducts();
    } else {
      showError(res.message);
    }
  } catch (error: any) {
    showError(error);
  } finally {
    hideLoading();
  }
};

const openApprovalDialog = async (row: any) => {
  try {
    let res:any = await showDialog({
      title: '审核商品',
      visible: true,
      width: '300px',
      footer: false,
      slots: {
        content:{
          component: setProductStatus
        }
      }
    });
    
    closeDialog(res as App<Element>);
    
    changeProductStatus(row, res.data,2);
  } catch (error) {
    closeDialog(error as App<Element>);
    return;
  }
};

onMounted(()=>{
  getProducts(); // 组件挂载后产品数据
  getCategories()
});
</script>

<style lang="scss" scoped>
#products {
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

