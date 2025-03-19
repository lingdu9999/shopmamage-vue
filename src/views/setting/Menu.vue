<template>
  <el-container id="menu">
    <el-header>
      <el-button type="primary" @click="handleAdd">添加菜单</el-button>
      
      <el-input v-model.trim="searchName" placeholder="请输入菜单名称" style="width: 200px;margin-left: 20px;">
        <template #append>
          <span class="search-btn" @click="searchMenu">搜索</span>
        </template>
      </el-input>
    </el-header>

    <el-table :data="menuList" class="eltable">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="label" label="菜单名称"/>
      <el-table-column prop="path" label="路径" width="300"/>
      <el-table-column prop="icon" label="图标"/>
      <el-table-column prop="parentId" label="父级菜单">
        <template #default="scope">
          <el-text>{{ getParentMenu(scope.row.parentId) }}</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序"/>
      <el-table-column prop="isActive" label="状态">
        <template #default="scope">
          <el-text type="primary" v-if="scope.row.isActive">启用</el-text>
          <el-text type="danger" v-else>禁用</el-text>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button type="primary" @click="handleEdit(scope.row)" size="small">编辑</el-button>
          <el-button 
            type="danger" 
            @click="handleDelete(scope.row)" 
            size="small"
          >删除</el-button>
          <el-button 
            @click="changeMenuStatus(scope.row)" 
            :type="scope.row.isActive ? 'info' : 'success'" 
            size="small"
          >{{scope.row.isActive ? '禁用' : '启用'}}</el-button>
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

    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="menuForm" :rules="rules" ref="menuFormRef" label-width="100px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="menuForm.type" @change="handleTypeChange">
            <el-radio :label="1">一级菜单</el-radio>
            <el-radio :label="2">二级菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父级菜单" prop="parentId" v-if="menuForm.type === 2">
          <el-select v-model="menuForm.parentId" placeholder="请选择父级菜单">
            <el-option
              v-for="item in parentMenuOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="label">
          <el-input v-model="menuForm.label" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="menuForm.sortOrder" :min="0" style="width: 20px;"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, onMounted, inject } from 'vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance,FormRules } from 'element-plus'
import { showSuccess, showError, showDialog, closeDialog, showLoading, hideLoading } from '@/utils/utils'
import request from '@/config/request'
import {MENU_API} from '@/config/api'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();


const state = useStore();
// 分页相关
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

// 搜索相关
const searchName = ref('')

// 菜单列表数据
const menuList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加菜单')
const menuFormRef = ref<FormInstance>()

// 父级菜单选项
const parentMenuOptions = ref<[{
  id: 0,
  label: '',
}]>([] as any)

// 表单数据
const menuForm = reactive({
  id: '',
  label: '',
  path: '',
  icon: '',
  sortOrder: 0,
  isActive: true,
  type: 1, // 1: 一级菜单, 2: 二级菜单
  parentId: 0
})

// 表单验证规则
const rules = reactive<FormRules>({
  label: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: false, message: '请输入路径', trigger: 'blur' }],
  icon: [{ required: true, message: '请输入图标', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  parentId: [{ required: true, message: '请选择父级菜单', trigger: 'change' }]
})

const getMenu = inject('GET_MENU') as Function


function getParentMenu(parentId:number){
  if (parentId<= 0 ) {
    return ''
  }
  return parentMenuOptions.value.find(item => item.id == parentId)?.label
}

// 搜索菜单
const searchMenu = () => {
  currentPage.value = 1
  getMenuList()
}

// 获取菜单列表
const getMenuList = async () => {
  try {
    showLoading()
    const res = await request({
      url: MENU_API.GET_ALL_MENU,
      method: 'get',
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        label: searchName.value
      }
    })
    menuList.value = res.data.records
    total.value = res.data.total

  } catch (error) {
    showError('获取菜单列表失败')
  } finally {
    hideLoading()
  }
}
const getParent = async () =>{
  const parentMenu = await request.get(MENU_API.GET_PARENT)
  console.log(parentMenu);
  
  parentMenuOptions.value = parentMenu.data.filter((item:any) => item.label != '主页')
}

// 切换菜单状态
const changeMenuStatus = async (menu: any) => {
  try {
    const res = await showDialog({
      title: '提示',
      visible: true,
      width: '300px',
      slots: {
        default: '确定要修改状态吗'
      }
    })
    closeDialog(res)
    
    showLoading()
    menu.isActive = !menu.isActive
    // TODO: 调用修改状态接口
    let result:any = await request({
      url: MENU_API.SET_MENU_STATUS,
      method: 'post',
      data: menu
    })
    if (result.code === 200) {
      showSuccess('操作成功')
      getMenu()
      getMenuList()
    }else{
      showError(result.message)
    }
  } catch (error) {
    closeDialog(error)
  } finally {
    hideLoading()
  }
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getMenuList()
}

// 处理菜单类型变化
const handleTypeChange = (value: number) => {
  if (value === 1) {
    menuForm.parentId = 0
    menuForm.path = '' // 清空路径
    // 一级菜单路径可选
    rules.path = [{ required: false, message: '请输入路径', trigger: 'blur' }]
  } else {
    // 二级菜单路径必填
    rules.path = [{ required: true, message: '请输入路径', trigger: 'blur' }]
  }
}

// 添加菜单
const handleAdd = () => {
  dialogTitle.value = '添加菜单'
  dialogVisible.value = true
  // 重置表单
  getParent()
  Object.assign(menuForm, {
    id: '',
    label: '',
    path: '',
    icon: '',
    sortOrder: 0,
    isActive: true,
    type: 1,
    parentId: 0
  })
}

// 编辑菜单
const handleEdit = (row: any) => {
  getParent()
  dialogTitle.value = '编辑菜单'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(menuForm, {
    ...row,
    type: row.parentId ? 2 : 1
  })
}

// 删除菜单
const handleDelete = async (row: any) => {
  try {
    const dialog = await showDialog({
      title: '提示',
      visible: true,
      width: '300px',
      slots: {
        default: '确定要删除该菜单吗'
      }
    })
    closeDialog(dialog)
  } catch (error) {
    closeDialog(error)
  }
  try {
    let res:any = await request({
      url:MENU_API.DELETE_MENU,
      method:'post',
      data:row
    })
    if (res.code === 200) {
      showSuccess('删除成功')
      getMenu()
      getMenuList()
    }else{
      showError(res.message)
    }
  } catch (error:any) {
    showError(error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!menuFormRef.value) return
  
  await menuFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = { ...menuForm }
        // 如果是一级菜单，删除 parentId
        if (submitData.type === 1) {
          submitData.parentId == 0
        }
        console.log(submitData);
        let res:any = await request({
          url:submitData.id ? MENU_API.UPDATE_MENU:MENU_API.ADD_MENU,
          method:'POST',
          data:submitData
        })
        if (res.code == 200) {
          showSuccess(submitData.id ? '编辑成功':'添加成功')
          getMenu()
          getMenuList()
        }
      } catch (error) {
        showError('操作失败')
      }finally{
        dialogVisible.value = false
      }
    }
  })
}



// 初始化
onMounted(() => {
  
  let routeName = router.currentRoute.value.path;
  setTimeout(() => {
    if (route.path === routeName) {
      getMenuList()
      getParent()
    }
  });
})
</script>

<style lang="scss" scoped>
#menu {
  height: 100%;
  width: 100%;
  position: relative;

  .el-header {
    background-color: #f5f7fa;
    padding: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-table {
    overflow-y: auto;
    min-height: calc(100vh - 250px);
  }

  .el-button {
    margin-left: 10px;
  }

  .search-btn {
    cursor: pointer;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>