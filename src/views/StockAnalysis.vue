<template>
  <div class="stock-analysis">
    <!-- 单股分析 -->
    <div class="analysis-section">
      <div class="section-header">
        <h2 class="section-title">{{ stockName }} 威科夫分析</h2>
      </div>
      
      <div class="date-selection">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="getDateShortcuts()"
          size="large"
        />
        <el-button @click="analyzeStock" type="primary" :loading="analyzing" size="large">
          开始分析
        </el-button>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysisResult" class="analysis-result">
        <h3 class="result-title">分析结果</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="股票名称">
            <a :href="getStockLink(analysisResult)" target="_blank" rel="noopener noreferrer" class="stock-name-link">
              {{ analysisResult.name }}
            </a>
          </el-descriptions-item>
          <el-descriptions-item label="股票代码">{{ analysisResult.code }}</el-descriptions-item>
          <el-descriptions-item label="趋势">{{ analysisResult.trend }}</el-descriptions-item>
          <el-descriptions-item label="数据起始日期">{{ analysisResult.start_date }} 至 {{ analysisResult.end_date }}</el-descriptions-item>
          <el-descriptions-item label="信号">
            <el-tag :type="getSignalType(analysisResult.signal)">
              {{ analysisResult.signal }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            <el-progress :percentage="Math.round(analysisResult.confidence * 100)" />
          </el-descriptions-item>
          <el-descriptions-item label="支撑位" v-if="analysisResult.support_level">
            {{ analysisResult.support_level }}
          </el-descriptions-item>
          <el-descriptions-item label="阻力位" v-if="analysisResult.resistance_level">
            {{ analysisResult.resistance_level }}
          </el-descriptions-item>
          <el-descriptions-item label="成交量特征">{{ analysisResult.volume_pattern }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="analysisResult.analysis_details" class="analysis-details">
          <h4>详细分析</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item v-if="analysisResult.analysis_details.trend_analysis" label="趋势分析">
              {{ analysisResult.analysis_details.trend_analysis }}
            </el-descriptions-item>
            <el-descriptions-item v-if="analysisResult.analysis_details.volume_analysis" label="成交量分析">
              {{ analysisResult.analysis_details.volume_analysis }}
            </el-descriptions-item>
            <el-descriptions-item v-if="analysisResult.analysis_details.key_levels" label="关键价位">
              {{ analysisResult.analysis_details.key_levels }}
            </el-descriptions-item>
            <el-descriptions-item v-if="analysisResult.analysis_details.risk_assessment" label="风险评估">
              {{ analysisResult.analysis_details.risk_assessment }}
            </el-descriptions-item>
          </el-descriptions>
        </div>


      </div>

      <el-empty v-else description="暂无分析结果，请选择日期范围并点击开始分析" />
    </div>

    <!-- 费用详情对话框 -->
    <el-dialog
      v-model="costDialogVisible"
      title="费用详情"
      width="400px"
    >
      <div v-if="selectedAnalysis">
        <el-descriptions :column="1">
          <el-descriptions-item label="股票名称">{{ selectedAnalysis.name }} ({{ selectedAnalysis.code }})</el-descriptions-item>
          <el-descriptions-item label="分析日期">{{ selectedAnalysis.end_date }}</el-descriptions-item>
          <el-descriptions-item label="总Token使用量">{{ selectedAnalysis.token_usage || 0 }}</el-descriptions-item>
          <el-descriptions-item label="输入Token">{{ selectedAnalysis.prompt_tokens || 0 }}</el-descriptions-item>
          <el-descriptions-item label="输出Token">{{ selectedAnalysis.completion_tokens || 0 }}</el-descriptions-item>
          <el-descriptions-item label="分析费用">¥{{ (selectedAnalysis.cost || 0).toFixed(4) }}</el-descriptions-item>
          <el-descriptions-item label="分析时间">{{ selectedAnalysis.created_at }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 分析历史 -->
    <div class="history-section">
      <div class="section-header">
        <h2 class="section-title">分析历史</h2>
        <el-button @click="loadAnalysisHistory" type="primary" size="small" plain :loading="loadingHistory">
          刷新
        </el-button>
      </div>
      
      <!-- 搜索框 -->
      <div class="history-search">
        <span class="date-label">创建日期：</span>
        <el-date-picker
          v-model="historyDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="getDateShortcuts()"
          size="large"
        />
        
        <el-button @click="handleHistorySearchButton" type="primary" size="large">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
      </div>
      
      <div class="analysis-history">
        <el-table 
          :data="analysisHistoryItems" 
          class="history-table"
          v-loading="loadingHistory"
          highlight-current-row
          @row-click="handleHistoryRowClick"
        >
          <el-table-column prop="start_date" label="开始日期" width="100" />
          <el-table-column prop="end_date" label="结束日期" width="100" />
          <el-table-column prop="trend" label="趋势" width="80"  show-overflow-tooltip />
          <el-table-column prop="signal" label="信号" width="80" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag :type="getSignalType(row.signal)">
                  {{ row.signal }}
                </el-tag>
              </template>
            </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="70">
              <template #default="{ row }">
                {{ Math.round(row.confidence * 100) }}%
              </template>
            </el-table-column>
          <el-table-column label="费用" width="80">
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
          <el-table-column prop="support_level" label="支撑位" width="70">
            <template #default="{ row }">
              {{ row.support_level || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="resistance_level" label="阻力位" width="70">
            <template #default="{ row }">
              {{ row.resistance_level || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="volume_pattern" label="成交量特征" show-overflow-tooltip />
          <el-table-column prop="created_at" label="创建时间" width="180" />
        </el-table>
        
        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="historyCurrentPage"
            v-model:page-size="historyPageSize"
            :page-sizes="[10, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="analysisHistoryTotal"
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import api from '../api';
import { getStockLink } from '../utils/stockUtils';

export default {
  name: 'StockAnalysis',
  components: {
    Search
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const stockCode = ref(route.params.code || '');
    const costDialogVisible = ref(false);
    const selectedAnalysis = ref(null);
    const stockName = ref(route.params.name || '');
    const dateRange = ref([]);
    const analyzing = ref(false);
    const analysisResult = ref(null);
    const analysisHistoryItems = ref([]);
    const analysisHistoryTotal = ref(0);
    const historyCurrentPage = ref(1);
    const historyPageSize = ref(10);
    const loadingHistory = ref(false);
    const historySearchQuery = ref('');
    const historyDateRange = ref([]);

    // 分析股票
    const analyzeStock = async () => {
      if (!stockCode.value || !dateRange.value || dateRange.value.length !== 2) {
        return;
      }
      
      analyzing.value = true;
      analysisResult.value = await api.wyckoff.analyzeStock(
        stockCode.value,
        dateRange.value[0],
        dateRange.value[1]
      );
      analyzing.value = false;
      // 重新加载分析历史
      loadAnalysisHistory();
    };

    // 加载分析历史
    const loadAnalysisHistory = async () => {
      loadingHistory.value = true;
      try {
        // 确保 historyDateRange.value 是数组
        const dateRange = Array.isArray(historyDateRange.value) ? historyDateRange.value : [];
        const startDate = dateRange.length === 2 ? dateRange[0] : null;
        const endDate = dateRange.length === 2 ? dateRange[1] : null;
        
        const result = await api.wyckoff.getAnalysisHistory(
          stockCode.value, 
          historyCurrentPage.value, 
          historyPageSize.value,
          historySearchQuery.value || null,
          startDate,
          endDate
        );
        
        // 确保 result 是对象且包含必要的字段
        if (typeof result === 'object' && result !== null) {
          analysisHistoryItems.value = Array.isArray(result.items) ? result.items : [];
          analysisHistoryTotal.value = typeof result.total === 'number' ? result.total : 0;
          
          // 如果有历史记录且当前没有显示结果，显示最新的一条
          if (analysisHistoryItems.value.length > 0 && !analysisResult.value) {
            analysisResult.value = analysisHistoryItems.value[0];
          }
        } else {
          analysisHistoryItems.value = [];
          analysisHistoryTotal.value = 0;
        }
      } catch (error) {
        console.error('加载分析历史失败:', error);
        analysisHistoryItems.value = [];
        analysisHistoryTotal.value = 0;
      } finally {
        loadingHistory.value = false;
      }
    };





    // 处理历史记录搜索输入
    let historySearchTimer = null;
    const handleHistorySearchInput = () => {
      // 去除前后空格
      historySearchQuery.value = historySearchQuery.value.trim();
      if (historySearchTimer) {
        clearTimeout(historySearchTimer);
      }
      historySearchTimer = setTimeout(() => {
        historyCurrentPage.value = 1;
        loadAnalysisHistory();
      }, 300);
    };

    // 处理历史记录搜索按钮点击
    const handleHistorySearchButton = () => {
      // 去除前后空格
      historySearchQuery.value = historySearchQuery.value.trim();
      historyCurrentPage.value = 1;
      console.log('handleHistorySearchButton called with dateRange:', historyDateRange.value);
      loadAnalysisHistory();
    };

    // 处理历史记录光标失焦
    const handleHistorySearchBlur = () => {
      // 光标失焦时执行搜索，去除前后空格
      historySearchQuery.value = historySearchQuery.value.trim();
      historyCurrentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理历史记录搜索清空
    const handleHistorySearchClear = () => {
      historySearchQuery.value = '';
      historyCurrentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理分析历史分页大小变化
    const handleHistorySizeChange = (size) => {
      historyPageSize.value = size;
      historyCurrentPage.value = 1;
      loadAnalysisHistory();
    };

    // 处理分析历史页码变化
    const handleHistoryCurrentChange = (current) => {
      historyCurrentPage.value = current;
      loadAnalysisHistory();
    };

    // 点击历史记录行
    const handleHistoryRowClick = (row) => {
      analysisResult.value = row;
    };

    // 显示费用详情对话框
    const showCostDialog = (row) => {
      selectedAnalysis.value = row;
      costDialogVisible.value = true;
    };

    // 获取风险等级对应的标签类型
    const getRiskType = (riskLevel) => {
      const riskMap = {
        '低风险': 'success',
        '中风险': 'warning',
        '高风险': 'danger'
      };
      return riskMap[riskLevel] || 'info';
    };

    // 获取信号对应的标签类型
    const getSignalType = (signal) => {
      const signalMap = {
        '买入': 'success',
        '强烈买入': 'success',
        '卖出': 'danger',
        '强烈卖出': 'danger',
        '观望': 'warning',
        '持有': 'info'
      };
      return signalMap[signal] || 'info';
    };



    // 选择最近三个月
    const selectLastThreeMonths = () => {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      dateRange.value = [
        threeMonthsAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ];
    };

    onMounted(() => {
      // 设置默认日期范围
      selectLastThreeMonths();
      loadAnalysisHistory();
    });

    // 生成日期选择器的快捷选项
    const getDateShortcuts = () => {
      return [
        {
          text: '上周',
          value: () => {
            const today = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
            const lastMonday = new Date(lastWeek);
            const day = lastWeek.getDay();
            const diff = lastWeek.getDate() - day + (day === 0 ? -6 : 1);
            lastMonday.setDate(diff);
            const lastSunday = new Date(lastMonday);
            lastSunday.setDate(lastMonday.getDate() + 6);
            return [
              lastMonday.toISOString().split('T')[0],
              lastSunday.toISOString().split('T')[0]
            ];
          }
        },
        {
          text: '上个月',
          value: () => {
            const today = new Date();
            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return [
              firstDayOfLastMonth.toISOString().split('T')[0],
              lastDayOfLastMonth.toISOString().split('T')[0]
            ];
          }
        },
        {
          text: '最近三个月',
          value: () => {
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            return [
              threeMonthsAgo.toISOString().split('T')[0],
              today.toISOString().split('T')[0]
            ];
          }
        }
      ];
    };

    return {
      stockCode,
      stockName,
      dateRange,
      analyzing,
      analysisResult,
      analysisHistoryItems,
      analysisHistoryTotal,
      historyCurrentPage,
      historyPageSize,
      loadingHistory,
      historySearchQuery,
      historyDateRange,
      costDialogVisible,
      selectedAnalysis,
      getDateShortcuts,
      analyzeStock,
      loadAnalysisHistory,
      handleHistorySearchInput,
      handleHistorySearchButton,
      handleHistorySearchBlur,
      handleHistorySearchClear,
      handleHistorySizeChange,
      handleHistoryCurrentChange,
      handleHistoryRowClick,
      showCostDialog,
      getRiskType,
      getSignalType,
      getStockLink
    };
  }
};
</script>

<style scoped>
.stock-analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}

.analysis-section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.history-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
}

.date-selection {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  width: fit-content;
}

.analysis-result {
  margin-top: 2rem;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.analysis-result::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.stock-name-link {
  color: #45b7d1;
  text-decoration: none;
}

.stock-name-link:hover {
  text-decoration: underline;
  color: #3091b1;
}

.result-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a2e;
}

.analysis-details {
  margin-top: 2rem;
}

.analysis-details h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
}

.analysis-details :deep(.el-descriptions__label) {
    width: 120px !important;
    font-weight: 600 !important;
}

.analysis-details :deep(.el-descriptions__content) {
    width: calc(100% - 120px) !important;
}

.analysis-result .el-descriptions {
  min-width: 600px;
}

.analysis-history {
  margin-top: 1rem;
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
  min-width: 600px;
}

.history-table :deep(.el-table__row:hover) {
  background-color: #fafafa;
}

.search-container {
  margin-bottom: 1.5rem;
  max-width: 400px;
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

.search-input {
  width: 200px;
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .back-button {
    width: 100%;
  }
  
  .date-selection {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .el-date-picker {
    width: 100% !important;
  }
  
  .analyze-button {
    width: 100%;
  }
  
  .result-title {
    font-size: 1.1rem;
  }
  
  .el-descriptions {
    font-size: 0.9rem;
  }
  
  .el-descriptions__label {
    font-size: 0.85rem;
  }
  
  .analysis-details h4 {
    font-size: 1rem;
  }
  
  .history-section h3 {
    font-size: 1.1rem;
  }
  
  .history-search {
    flex-direction: column;
    align-items: stretch;
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
  
  .date-selection {
    gap: 0.5rem;
  }
  
  .el-descriptions {
    font-size: 0.8rem;
  }
  
  .el-descriptions__label {
    font-size: 0.75rem;
  }
  
  .details-content pre {
    font-size: 0.7rem;
    line-height: 1.3;
  }
  
  .el-pagination {
    font-size: 0.7rem;
  }
  
  .el-pagination__jump {
    display: none;
  }
}


</style>
