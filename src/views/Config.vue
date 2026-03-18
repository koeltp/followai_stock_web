<template>
  <div class="config-page">
    <h2 class="page-title">系统配置</h2>
    
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>API配置</span>
        </div>
      </template>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索配置键、配置值或描述"
          clearable
          @input="handleSearchInput"
          @clear="handleSearchClear"
          class="search-input"
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" class="search-button" size="large">
          搜索
        </el-button>
      </div>
      
      <el-table 
        :data="filteredConfigs" 
        style="width: 100%" 
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="key_name" label="配置键" width="250" />
        <el-table-column prop="key_value" label="配置值" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              v-if="editingRow === row.id"
              v-model="editForm.key_value"
              type="text"
              size="small"
            />
            <span v-else>{{ row.key_value }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              v-if="editingRow === row.id"
              v-model="editForm.description"
              type="text"
              size="small"
            />
            <span v-else>{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div v-if="editingRow === row.id">
              <el-button 
                @click="saveConfig(row)" 
                type="primary" 
                size="small"
                :loading="saving"
              >
                保存
              </el-button>
              <el-button 
                @click="cancelEdit" 
                size="small"
                style="margin-left: 8px"
              >
                取消
              </el-button>
            </div>
            <div v-else>
              <el-button 
                @click="editConfig(row)" 
                type="primary" 
                size="small"
                plain
              >
                编辑
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import api from '../api';

export default {
  name: 'Config',
  components: {
    Search
  },
  setup() {
    const configs = ref([]);
    const editingRow = ref(null);
    const editForm = ref({});
    const saving = ref(false);
    const loading = ref(false);
    const searchQuery = ref('');
    
    // 加载配置
    const loadConfigs = async () => {
      loading.value = true;
      try {
        const data = await api.config.getConfigs();
        configs.value = data.configs;
        console.log('加载的配置数据:', configs.value);
      } catch (error) {
        console.error('加载配置失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 将扁平数据转换为树形结构
    const buildTree = (data, parentId = '0') => {
      const result = [];
      for (const item of data) {
        // 统一处理 parent 字段值，确保类型一致
        const itemParent = String(item.parent);
        const currentParentId = String(parentId);
        
        if (itemParent === currentParentId) {
          const children = buildTree(data, item.id);
          if (children.length > 0) {
            item.children = children;
            item.hasChildren = true;
          }
          result.push(item);
        }
      }
      return result;
    };
    
    // 过滤树形数据
    const filterTree = (tree, query) => {
      const result = [];
      for (const item of tree) {
        const match = item.key_name.toLowerCase().includes(query) || 
                      (item.key_value && item.key_value.toLowerCase().includes(query)) ||
                      (item.description && item.description.toLowerCase().includes(query));
        
        let filteredChildren = [];
        if (item.children) {
          filteredChildren = filterTree(item.children, query);
        }
        
        if (match || filteredChildren.length > 0) {
          const newItem = { ...item };
          if (filteredChildren.length > 0) {
            newItem.children = filteredChildren;
          }
          result.push(newItem);
        }
      }
      return result;
    };
    
    // 过滤后的配置列表（树形结构，支持搜索）
    const filteredConfigs = computed(() => {
      const tree = buildTree(configs.value);
      
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase();
        return filterTree(tree, query);
      }
      
      return tree;
    });
    
    // 处理搜索输入
    let searchTimer = null;
    const handleSearchInput = () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        // 搜索逻辑已在computed中处理
      }, 300);
    };
    
    // 处理搜索清空
    const handleSearchClear = () => {
      searchQuery.value = '';
    };
    
    // 处理搜索按钮点击
    const handleSearch = () => {
      // 搜索逻辑已在computed中处理，这里可以添加额外的逻辑
      console.log('搜索:', searchQuery.value);
    };
    
    // 编辑配置
    const editConfig = (row) => {
      editingRow.value = row.id;
      editForm.value = {
        key_name: row.key_name,
        key_value: row.key_value,
        description: row.description
      };
    };
    
    // 取消编辑
    const cancelEdit = () => {
      editingRow.value = null;
      editForm.value = {};
    };
    
    // 保存配置
    const saveConfig = async (row) => {
      saving.value = true;
      try {
        await api.config.updateConfig(editForm.value);
        // 重新加载配置
        await loadConfigs();
        editingRow.value = null;
        editForm.value = {};
      } catch (error) {
        console.error('保存配置失败:', error);
      } finally {
        saving.value = false;
      }
    };
    
    onMounted(() => {
      loadConfigs();
    });
    
    return {
      configs,
      filteredConfigs,
      editingRow,
      editForm,
      saving,
      loading,
      searchQuery,
      loadConfigs,
      handleSearchInput,
      handleSearchClear,
      handleSearch,
      editConfig,
      cancelEdit,
      saveConfig
    };
  }
};
</script>

<style scoped>
.config-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 2rem;
  text-align: center;
}

.config-card {
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 1rem;
  font-weight: 600;
}

.search-container {
  margin-bottom: 1.5rem;
  max-width: 500px;
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
}

.search-button {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .config-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .search-container {
    max-width: 100%;
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
  
  .el-table {
    font-size: 0.8rem;
  }
  
  .el-table-column {
    width: 100px !important;
  }
}
</style>
