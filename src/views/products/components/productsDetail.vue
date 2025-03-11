<template>
    <el-form :model="product" ref="productForm" :rules="props.mode === 'view' ? {} : productRoles" label-width="100px" id="product">
      <el-form-item label="SKU:" v-if="viewSKU">
        <el-input v-model="product.sku" v-if="!isViewMode" disabled></el-input>
        <el-text v-else>{{ product.sku }}</el-text>
      </el-form-item>
      <el-form-item label="产品名:" prop="name">
        <el-input v-model="product.name" v-if="!isViewMode"></el-input>
        <el-text v-else>{{ product.name }}</el-text>
      </el-form-item>
      <el-form-item label="分类:" prop="subcategoryId">
        <el-cascader
          class="category"
          v-model="categoryIds"
          :options="categories"
          :props="cascaderProps"
          placeholder="请选择分类"
          style="width: 250px;"
          @change="changeCategory"
          v-if="!isViewMode">
        </el-cascader>
        <el-text v-else>{{ product.categoryName }}</el-text>
      </el-form-item>
      <el-form-item label="价格:" prop="price">
        <el-input v-model.number="product.price" type="number" v-if="!isViewMode" min="0"></el-input>
        <el-text v-else>{{ product.price }}</el-text>
      </el-form-item>
      <el-form-item label="库存:" prop="stock">
        <el-input v-model.number="product.stock" type="number" v-if="!isViewMode" min="0"></el-input>
        <el-text v-else>{{ product.stock }}</el-text>
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input type="textarea" v-model="product.description" v-if="!isViewMode"></el-input>
        <el-text v-else>{{ product.description }}</el-text>
      </el-form-item>
      <el-form-item label="生产日期:" prop="productionDate">
        <el-date-picker
          v-model="product.productionDate"
          type="date"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          style="width: 250px;"
          :clearable="false"
          :disabled-date="(time) => time.getTime() > Date.now()"
          v-if="!isViewMode"
        ></el-date-picker>
        <el-text v-else>{{ product.productionDate }}</el-text>
      </el-form-item>
      <el-form-item label="质保天数:" prop="shelfDays">
        <el-input v-model.number="product.shelfDays" type="number" v-if="!isViewMode" min="0"></el-input>
        <el-text v-else>{{ product.shelfDays == null ? '无' : product.shelfDays}}</el-text>
      </el-form-item>
      <el-form-item label="图片:" prop="imageUrls">
        <el-upload
          v-if="!isViewMode"
          v-model:file-list="fileList"
          class="avatar-uploader"
          :action="FILE_URL+'/upload'"
          :show-file-list="true"
          list-type="picture-card"
          :on-success="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <template v-else>
          <div class="product_images">
            <template v-for="(item,index) in product.imageUrls" :key="index">
              <el-image
                style="width: 150px; height: 150px; margin: 0 10px; border-radius: 5px;"
                :src="FILE_URL + item.imageUrl"
                :zoom-rate="1.2"
                :max-scale="7"
                :min-scale="0.2"
                show-progress
                :initial-index="4"
                fit="cover"
              />
            </template>
          </div>
        </template>
      </el-form-item>
      <el-form-item label="动态属性:" prop="attributes">
        <template v-if="!isViewMode">
          <div v-for="(attribute, index) in product.attributes" :key="index" class="attribute-item">
            <el-input v-model="attribute.name" placeholder="属性名" class="attribute-input"></el-input>
            <el-input v-model="attribute.value" placeholder="属性值" class="attribute-input"></el-input>
            <el-button @click="removeAttribute(index)" type="danger" class="remove-button">删除</el-button>
          </div>
          <el-button @click="addAttribute" type="primary">添加属性</el-button>
        </template>
        <template v-else>
          <div v-for="(attribute, index) in product.attributes" :key="index" class="attribute-item">
            <el-text>{{ attribute.name }} --- {{ attribute.value }}</el-text>
          </div>
        </template>
      </el-form-item>
      <el-form-item label="状态:">
        <el-select v-model="product.status" v-if="!isViewMode" :disabled="product.status === 2">
          <el-option label="审核中" :value=2></el-option>
          <el-option label="上架" :value=1></el-option>
          <el-option label="下架" :value=0></el-option>
        </el-select>
        <el-text v-else>{{ product.status === 1 ? '上架' : product.status === 2 ? '审核中' :  '下架' }}</el-text>
      </el-form-item>
    </el-form>
    
    <div class="button-container" v-if="!isViewMode">
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button @click="close">取 消</el-button>
    </div>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted,reactive,computed } from 'vue';
import { FormRules,FormInstance,ElButton,ElForm,ElFormItem,ElInput,ElText,ElOption,ElUpload,ElDatePicker,ElSelect,ElIcon,ElDialog,ElCascader,ElImage } from 'element-plus';
import type { UploadProps,UploadUserFile  } from 'element-plus'
import { ProductInfo } from '@/config/common';
import { showError } from '@/utils/utils';
import { FILE_URL,CATEGORY_API, PRODUCT_API } from '@/config/api';
import { Plus } from '@element-plus/icons-vue';
import  request  from '@/config/request';

const props = defineProps<{
  productData: ProductInfo | null
  mode: string
  s: (data?:any) => void;
  e: (data?:any) => void;
}>();

const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const isViewMode = ref(props.mode === 'view')
const viewSKU = computed(()=>{
  return props.mode != 'add'
})


const categoryIds = ref<number[]>([])

const productRoles = reactive<FormRules>({
  name: [{ required: true, message: '请输入产品名', trigger: 'blur' }],
  subcategoryId: [{ required: true, message: '请选择分类', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  price: [
    { required: true, type: 'number', message: '请输入价格', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('价格必须大于0'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('库存不能小于0'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  productionDate: [{ required: true, type: 'date', message: '请选择生产日期', trigger: 'blur' }],
  attributes: [
  { required: true ,message: '最少需要有一个属性', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('动态属性最少需要有一个属性'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  imageUrls: [
  { required: true,message: '图片最少需要上传一张', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('图片最少需要上传一张'));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }]
});


const product = reactive<ProductInfo>({
  sku:'',
  name:'',
  description:'',
  price:'',
  stock:'',
  subcategoryId:'',
  mainImage:'',
  productionDate:'',
  shelfDays:'',
  categoryName:'',
  attributes: [{ name: '', value: '' }],
  status: 1,
  imageUrls:[]
});
// const isViewMode = ref(props.mode === 'view');

const productForm = ref<FormInstance>();

const categories = ref([]); // 存储分类数据
const cascaderProps = {
    value: 'categoryId',
    label: 'name',
    children: 'children',
};

function close(){
  props.e();
};

const changeCategory = (val:any) => {
  product.subcategoryId = val[val.length-1]
};

function addAttribute() {
  product.attributes.push({ name: '', value: '' });
}

function removeAttribute(index: number) {
  product.attributes.splice(index, 1);
}

const handleRemove: UploadProps['onRemove'] = (uploadFile:any, uploadFiles) => {
  product.imageUrls =product.imageUrls!.filter(item=>!item.imageUrl.includes(uploadFile.response.data))
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const beforeAvatarUpload = (file: any) => {
  let typeList = ['image/jpeg','image/png','image/jpg'];
  if (!typeList.includes(file.type)) {
    showError('图片必须是JPG、PNG、JPEG格式!')
    return false
  } else if (file.size / 1024 / 1024 > 2) {
    showError('图片不能超过2MB!')
    return false
  }
  return true
};


const handleAvatarChange = (res:any) => {
  if (res.code === 200) {
    product.imageUrls?.push({
      productId:product?.productId,
      imageUrl: '/image/'+res.data
    })
  }else{
    showError(res.message);
  }
};

function submit() {
  productForm.value?.validate((valid:any) => {
    if (valid) {
      product.mainImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0].imageUrl : ''
      product.subcategoryId = categoryIds.value[categoryIds.value.length-1]
      
      console.log('提交的数据:', JSON.stringify(product));
      
      props.s(product);
      // 在这里调用后端 API
    } else {
      console.log('表单验证失败');
      return;
    }
  });
}

onMounted(async () => {
  productForm.value?.resetFields();
  Object.assign(product,{
    sku:'',
    name:'',
    description:'',
    price:0,
    stock:'',
    subcategoryId:'',
    mainImage:'',
    productionDate:'',
    shelfDays:'',
    categoryName:'',
    attributes: [{ name: '', value: '' }],
    status: 1,
    imageUrls:[]
  } as ProductInfo)
  await getCategories();
  if (props.productData) {
    await initProductData();
    
    
    let res:any = await request({
      url:CATEGORY_API.GET_PARENT_CATEGORY,
      method:'GET',
      params:{
        subcategoryId:props.productData.subcategoryId
      }
    })
    if (res.code === 200) {
      product.categoryName = res.data.name+'/'+ product.categoryName
      categoryIds.value.push(res.data.categoryId as number)
      categoryIds.value.push(product.subcategoryId as number)
    }else{ 
      showError(res.message)
    }
  }

});

async function initProductData() {
  let res:any = await request({
    url:PRODUCT_API.GET_PRODUCT_DETAIL,
    method:'POST',
    params:{
      id:props.productData?.productId
    }
  })
  if (res.code === 200) {
    
    Object.assign(product,JSON.parse(JSON.stringify(res.data)))
    product.imageUrls = res.data.imageUrls
    product.imageUrls?.map(item=>{
      console.log(item);
      
      fileList.value?.push({
        name:item?.imageUrl,
        url: FILE_URL + item?.imageUrl
      })
    })
    product.attributes = res.data.attributes
  }else{  
    showError(res.message)
  }
}

// 这里可以添加获取分类的 API 函数
async function getCategories() {

    // 这里是模拟的 API 调用，实际应替换为真实的 API 调用
  try {
    let res:any = await request.get(CATEGORY_API.LIST_CATEGORY)
    if (res.code === 200) {
      categories.value = res.data
    }else{
      showError(res.message)
    }
  } catch (error:any) {
    showError(error)
  }
}
</script>

<style lang="scss" scoped>

#product{
  max-height: 650px;
  overflow: auto;

}

.el-form {
    margin: 20px auto; /* Center the form */
    max-width: 800px; /* Limit the width of the form */
}

.el-form-item {
    margin-bottom: 15px;
}

.el-button {
    margin-right: 10px;
}

.el-input, .el-text, .el-date-editor, .el-cascader, .el-select {
    width: 250px;
}


.el-form-item label {
    font-weight: bold !important;
    font-size: 16px;
    color: #333 !important;
}

.el-text {
    font-size: 14px;
    color: #666;
}

.el-button.primary {
    background-color: #409EFF;
    border-color: #409EFF;
}

.el-button.primary:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
}

.button-container {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    margin-top: 20px; /* Add some space above the buttons */
}

.attribute-item {
    display: flex;
    align-items: center; /* Center items vertically */
    margin-bottom: 10px; /* Space between attribute items */
}

.attribute-input {
    flex: 1; /* Allow inputs to take available space */
    margin-right: 20px; /* Space between inputs and button */
}

.remove-button {
    margin-left: 10px; /* Space before the delete button */
}
</style>