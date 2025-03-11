<template>
  <el-menu
    background-color="#324157"
    text-color="#fff"
    mode="horizontal"
    :popper-offset="0"
    router
    id="menu-bar"
  >
    <template v-for="item in menuList" :key="item.label">
      <el-sub-menu v-if="item.children.length > 0" :index="item.label" :key="item.label">
        <template #title>
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item
          v-for="subItem in item.children"
          :key="subItem.label"
          :index="subItem.path"
        >
          <el-icon><component :is="subItem.icon" /></el-icon>
          {{ subItem.label }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
// 定义菜单项的类型
interface MenuItem {
  label: string;
  icon: string | null;
  path: string | null;
  children: MenuItem[];
}

defineProps<{
  menuList: MenuItem[];
}>();
</script>

<style lang="scss">
#menu-bar {
  border-bottom: 1px solid #e0e0e0 !important; /* 添加底部边框 */

  /* 去掉激活样式 */
  .el-menu-item.is-active,
  .el-sub-menu.is-active {
    background-color: transparent !important; /* 去掉激活时的背景颜色 */
    color: #fff !important; /* 保持字体颜色 */
    border: none !important;

    .el-sub-menu__title {
      background-color: transparent !important; /* 去掉激活时的背景颜色 */
      color: #fff !important; /* 保持字体颜色 */
      border: none !important;
    }
  }
}
</style> 