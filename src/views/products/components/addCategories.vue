<template>
  <el-form :model="Category" ref="categoryRef" :rules="categoryRole" @submit.prevent="addCategory"  label-width="80px">
    <el-form-item label="主分类" prop="name">
      <el-input v-model="Category.name" placeholder="请输入主分类" />
    </el-form-item>
    <el-form-item label="子分类">
      <el-input-tag
        v-model="subCategories"
        placeholder="输入子分类后按回车"
        @change="handleTagChange"
        @add-tag="addTag"
        @remove-tag="removeTag"
      />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input v-model="Category.description" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" maxlength="120" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="addCategory">提交</el-button>
      <el-button  @click="exit">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref,onMounted,reactive } from 'vue';
import {FormRules,FormInstance, ElButton, ElForm, ElFormItem, ElInput,ElInputTag } from 'element-plus';
import { CategoryInfo } from '@/config/common';

const Category = ref<CategoryInfo>({} as CategoryInfo);
const subCategories = ref<string[]>([]);


const categoryRef = ref<FormInstance>();
const categoryRole = reactive<FormRules>({
  name: [{ required: true, message: '请输入分类名', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
});

const props = defineProps<{
  categoryData:CategoryInfo|null
  s: (data?:any) => void;
  e: (data?:any) => void;
}>();

onMounted(()=>{
  categoryRef.value?.resetFields();
  Category.value = {
    name:'',
    description:'',
    children:[] as CategoryInfo[]
  } as CategoryInfo;
  if (props.categoryData) {
    Category.value = JSON.parse(JSON.stringify(props.categoryData));
    
    subCategories.value = Category.value.children.map(item=>item.name);
  }
})

function handleTagChange(tags:any){
  subCategories.value = tags;
}

function addTag(val:string){
  Category.value.children.push({
    name:val,
    categoryId:Category.value.categoryId
  } as CategoryInfo)
}

function removeTag(val:string){
  Category.value.children = Category.value.children.filter(item=>item.name!=val)
}

function addCategory() {
  categoryRef.value?.validate((valid)=>{
    if (valid) {
      props.s(JSON.parse(JSON.stringify(Category.value)));
      Category.value = {} as CategoryInfo;
    }
  })
}

function exit(){
  Category.value = {
    name:'',
    description:'',
    children:[] as CategoryInfo[]
  } as CategoryInfo;
  subCategories.value = []
  props.e();
}
</script>

<style scoped>
/* 根据需要添加样式 */
</style>