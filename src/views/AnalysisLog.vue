<template>
  <div class="analysis-log">
    <div class="page-header">
      <h1 class="page-title">分析日志</h1>
    </div>

    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="history-search">
        <span class="date-label">创建日期：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="getDateShortcuts()"
          class="date-picker"
        />
        <el-input
          v-model="searchQuery"
          placeholder="搜索分析日志..."
          class="search-input"
          @input="handleSearchInput"
          @blur="handleSearchBlur"
          clearable
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button @click="handleSearchButton" type="primary">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
      </div>
    </div>

    <!-- 分析日志列表 -->
    <div class="analysis-logs">
      <el-table 
        :data="analysisLogs.items" 
        class="logs-table"
        v-loading="loading"
        highlight-current-row
      >
        <el-table-column prop="id" label="日志ID" width="80" />
        <el-table-column prop="code" label="股票代码" width="100" />
        <el-table-column prop="name" label="股票名称" width="120" />
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="chat_completion_id" label="Chat ID" width="200"   show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="reparseLog(row.id)"
              :loading="reparsingLogs.includes(row.id)"
            >
              重新解析
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              @click="viewLogDetails(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="analysisLogs.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailsVisible"
      title="分析日志详情"
      width="50%"
      :max-height="'70vh'"
      class="log-dialog"
    >
      <div v-if="selectedLog">
        <el-descriptions :column="1">
          <el-descriptions-item label="ID">{{ selectedLog.id }}</el-descriptions-item>
          <el-descriptions-item label="股票代码">{{ selectedLog.code }}</el-descriptions-item>
          <el-descriptions-item label="股票名称">{{ selectedLog.name }}</el-descriptions-item>
          <el-descriptions-item label="分析周期">{{ selectedLog.start_date }} 至 {{ selectedLog.end_date }}</el-descriptions-item>
          <el-descriptions-item label="Chat ID">{{ selectedLog.chat_completion_id }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedLog.created_at }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="log-content">
          <h4>提示词</h4>
          <pre class="prompt-content">{{ selectedLog.prompt }}</pre>
          
          <h4>响应结果</h4>
          <pre class="response-content">{{ selectedLog.response }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import api from '../api';
import { getDateShortcuts } from '../utils/dateUtils';

export default {
  name: 'AnalysisLog',
  components: {
    Search
  },
  setup() {
    const analysisLogs = ref({ total: 0, items: [] });
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const searchQuery = ref('');
    const dateRange = ref([]);
    const logDetailsVisible = ref(false);
    const selectedLog = ref(null);
    const reparsingLogs = ref([]);

    // 加载分析日志
    const loadAnalysisLogs = async () => {
      loading.value = true;
      try {
        // 确保 dateRange.value 是数组
        const dateRangeArray = Array.isArray(dateRange.value) ? dateRange.value : [];
        const startDate = dateRangeArray.length === 2 ? dateRangeArray[0] : null;
        const endDate = dateRangeArray.length === 2 ? dateRangeArray[1] : null;
        
        const result = await api.wyckoff.getAnalysisLogs(
          null, 
          currentPage.value, 
          pageSize.value,
          searchQuery.value || null,
          startDate,
          endDate
        );
        
        // 确保 result 是对象且包含必要的字段
        if (typeof result === 'object' && result !== null) {
          analysisLogs.value = {
            total: typeof result.total === 'number' ? result.total : 0,
            items: Array.isArray(result.items) ? result.items : []
          };
        } else {
          analysisLogs.value = { total: 0, items: [] };
        }
      } catch (error) {
        console.error('加载分析日志失败:', error);
        analysisLogs.value = { total: 0, items: [] };
      } finally {
        loading.value = false;
      }
    };

    // 处理搜索输入
    let searchTimer = null;
    const handleSearchInput = () => {
      // 去除前后空格
      searchQuery.value = searchQuery.value.trim();
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        currentPage.value = 1;
        loadAnalysisLogs();
      }, 300);
    };

    // 处理搜索按钮点击
    const handleSearchButton = () => {
      // 去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadAnalysisLogs();
    };

    // 处理搜索光标失焦
    const handleSearchBlur = () => {
      // 光标失焦时执行搜索，去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadAnalysisLogs();
    };

    // 处理搜索清空
    const handleSearchClear = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      loadAnalysisLogs();
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      loadAnalysisLogs();
    };

    // 处理页码变化
    const handleCurrentChange = (current) => {
      currentPage.value = current;
      loadAnalysisLogs();
    };

    // 查看日志详情
    const viewLogDetails = (row) => {
      selectedLog.value = row;
      logDetailsVisible.value = true;
    };

    // 重新解析日志
    const reparseLog = async (logId) => {
      try {
        reparsingLogs.value.push(logId);
        await api.wyckoff.reparseLog(logId);
        ElMessage.success('重新解析成功');
        // 重新加载日志列表
        loadAnalysisLogs();
      } catch (error) {
        ElMessage.error(`重新解析失败: ${error.response?.data?.detail || error.message}`);
      } finally {
        reparsingLogs.value = reparsingLogs.value.filter(id => id !== logId);
      }
    };


    onMounted(() => {
      loadAnalysisLogs();
    });

    return {
      analysisLogs,
      loading,
      currentPage,
      pageSize,
      searchQuery,
      dateRange,
      logDetailsVisible,
      selectedLog,
      reparsingLogs,
      loadAnalysisLogs,
      handleSearchInput,
      handleSearchButton,
      handleSearchBlur,
      handleSearchClear,
      handleSizeChange,
      handleCurrentChange,
      viewLogDetails,
      reparseLog,
      getDateShortcuts
    };
  }
};
</script>

<style scoped>
.analysis-log {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  min-width: 1120px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a2e;
}

.search-container {
  margin-bottom: 2rem;
  width: 100%;
  min-width: 1120px;
  box-sizing: border-box;
}

.history-search {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  width: fit-content;
}

.date-label {
  font-weight: 500;
  white-space: nowrap;
}

.date-picker {
  min-width: 300px;
}

.search-input {
  width: 200px;
}

.analysis-logs {
  margin-top: 2rem;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  width: 100%;
  min-width: 1120px;
  box-sizing: border-box;
}

.analysis-logs::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.logs-table {
  width: 100% !important;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow-x: auto;
  min-width: 1120px !important;
  box-sizing: border-box;
}

.logs-table :deep(.el-table__body) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table__header-wrapper) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table__body-wrapper) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table__container) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table__header) {
  width: 100% !important;
  min-width: 1120px !important;
}

.logs-table :deep(.el-table__row:hover) {
  background-color: #fafafa;
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.log-content {
  margin-top: 2rem;
}

.log-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
}

.prompt-content,
.response-content {
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  color: #666666;
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analysis-log {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .history-search {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-date-picker {
    width: 100% !important;
  }
  
  .search-input {
    width: 100%;
  }
  
  .logs-table {
    min-width: 600px;
  }
  
  .el-pagination {
    font-size: 0.8rem;
  }
  
  .el-pagination__sizes {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .logs-table {
    min-width: 400px;
  }
  
  .el-pagination {
    font-size: 0.7rem;
  }
  
  .el-pagination__jump {
    display: none;
  }
  
  .prompt-content,
  .response-content {
    font-size: 0.7rem;
    line-height: 1.3;
    max-height: 300px;
  }
}

/* 日志对话框样式 */
.log-dialog :deep(.el-dialog) {
  max-height: 90vh;
  overflow: hidden;
}

.log-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem;
}

.log-content {
  margin-top: 1rem;
}

.prompt-content,
.response-content {
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: 1rem;
}
</style>