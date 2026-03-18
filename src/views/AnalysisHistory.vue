<template>
  <div class="analysis-history-page">
    <h1 class="page-title">分析历史</h1>
    
    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-row">
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
          size="large"
        />
        
        <el-input
          v-model="searchQuery"
          placeholder="搜索股票代码或名称"
          class="search-input"
          @input="handleSearchInput"
          @blur="handleSearchBlur"
          clearable
          @clear="handleSearchClear"
          size="large"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button @click="handleSearchButton" type="primary" size="large">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
      </div>
    </div>
    
    <!-- 分析历史表格 -->
    <div class="analysis-history">
      <el-table 
        :data="analysisHistoryItems" 
        class="history-table"
        v-loading="loading"
        highlight-current-row
      >
        <el-table-column prop="code" label="股票代码" width="90" />
        <el-table-column label="股票名称" width="120">
            <template #default="{ row }">
              <a :href="`https://stockpage.10jqka.com.cn/${row.code.replace(/^[a-z]+\./i, '')}/`" target="_blank" rel="noopener noreferrer" class="stock-name-link" title="去同花顺查K线图">
                {{ row.name }}
              </a>
            </template>
          </el-table-column>
        <el-table-column prop="trend" label="趋势" width="100" show-overflow-tooltip />
        <el-table-column prop="signal" label="信号" width="80" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag :type="getSignalType(row.signal)">
                {{ row.signal }}
              </el-tag>
            </template>
          </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="80">
            <template #default="{ row }">
              {{ Math.round(row.confidence * 100) }}%
            </template>
          </el-table-column>
        <el-table-column label="费用" width="100">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                plain
                @click="showCostDialog(row)"
              >
                ¥{{ row.cost.toFixed(4) }}
              </el-button>
            </template>
          </el-table-column>
        <el-table-column prop="support_level" label="支撑位" width="80">
          <template #default="{ row }">
            {{ row.support_level || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="resistance_level" label="阻力位" width="80">
          <template #default="{ row }">
            {{ row.resistance_level || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="volume_pattern" label="成交量特征" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button @click="handleRowClick(row)" type="primary" size="small" plain>
              详细
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
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 费用详情对话框 -->
    <el-dialog
      v-model="costDialogVisible"
      title="费用详情"
      width="400px"
    >
      <div v-if="selectedAnalysis">
        <p>股票：{{ selectedAnalysis.name }} ({{ selectedAnalysis.code }})</p>
        <p>分析时间：{{ selectedAnalysis.created_at }}</p>
        <p>总token数：{{ selectedAnalysis.token_usage }}</p>
        <p>费用：¥{{ selectedAnalysis.cost.toFixed(4) }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="costDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import api from '../api';
import { getDateShortcuts } from '../utils/dateUtils';

export default {
  name: 'AnalysisHistory',
  components: {
    Search
  },
  setup() {
    const router = useRouter();
    
    const analysisHistoryItems = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const loading = ref(false);
    const dateRange = ref([]);
    const searchQuery = ref('');
    const costDialogVisible = ref(false);
    const selectedAnalysis = ref(null);

    // 加载分析历史
    const loadAnalysisHistory = async () => {
      loading.value = true;
      try {
        // 确保 dateRange.value 是数组
        const startDate = dateRange.value.length === 2 ? dateRange.value[0] : null;
        const endDate = dateRange.value.length === 2 ? dateRange.value[1] : null;
        
        const result = await api.wyckoff.getAnalysisHistory(
          null, // 不指定股票代码，获取所有
          currentPage.value, 
          pageSize.value,
          searchQuery.value || null,
          startDate,
          endDate
        );
        
        // 确保 result 是对象且包含必要的字段
        if (typeof result === 'object' && result !== null) {
          analysisHistoryItems.value = Array.isArray(result.items) ? result.items : [];
          total.value = typeof result.total === 'number' ? result.total : 0;
        } else {
          analysisHistoryItems.value = [];
          total.value = 0;
        }
      } catch (error) {
        console.error('加载分析历史失败:', error);
        analysisHistoryItems.value = [];
        total.value = 0;
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
        loadAnalysisHistory();
      }, 300);
    };

    // 处理搜索按钮点击
    const handleSearchButton = () => {
      // 去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理光标失焦
    const handleSearchBlur = () => {
      // 光标失焦时执行搜索，去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理搜索清空
    const handleSearchClear = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理页码变化
    const handleCurrentChange = (current) => {
      currentPage.value = current;
      loadAnalysisHistory();
    };

    // 处理表格行点击
    const handleRowClick = (row) => {
      router.push({
        name: 'analysis',
        params: {
          code: row.code,
          name: row.name
        }
      });
    };

    // 显示费用详情对话框
    const showCostDialog = (row) => {
      selectedAnalysis.value = row;
      costDialogVisible.value = true;
    };

    // 获取信号类型
    const getSignalType = (signal) => {
      if (!signal) {
        return 'primary';
      }
      switch (signal) {
        case '买入':
          return 'success';
        case '卖出':
          return 'danger';
        case '持有':
          return 'warning';
        case '观望':
          return 'info';
        default:
          return 'primary';
      }
    };


    onMounted(() => {
      loadAnalysisHistory();
    });

    return {
      analysisHistoryItems,
      total,
      currentPage,
      pageSize,
      loading,
      dateRange,
      searchQuery,
      costDialogVisible,
      selectedAnalysis,
      loadAnalysisHistory,
      handleSearchInput,
      handleSearchButton,
      handleSearchBlur,
      handleSearchClear,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick,
      showCostDialog,
      getSignalType,
      getDateShortcuts
    };
  }
};
</script>

<style scoped>
.analysis-history-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.page-title {
  margin: 0 0 2rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a2e;
}

.search-container {
  margin-bottom: 2rem;
  width: 100%;
}

.search-row {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  width: 250px;
}

.analysis-history {
  margin-top: 2rem;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.analysis-history::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.history-table {
  cursor: pointer;
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow-x: auto;
  min-width: 1000px;
}

.history-table :deep(.el-table__row:hover) {
  background-color: #fafafa;
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.stock-name-link {
  color: #45b7d1;
  text-decoration: none;
  cursor: pointer;
}

.stock-name-link:hover {
  text-decoration: underline;
  color: #3091b1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-picker {
    width: 100% !important;
  }
  
  .search-input {
    width: 100%;
  }
  
  .el-table {
    font-size: 0.9rem;
  }
  
  .el-table-column {
    width: auto !important;
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
  
  .search-row {
    gap: 0.5rem;
  }
  
  .el-table {
    font-size: 0.8rem;
  }
  
  .el-button {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
  }
  
  .el-pagination {
    font-size: 0.7rem;
  }
}
</style>