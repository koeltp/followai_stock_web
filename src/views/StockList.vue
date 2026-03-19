<template>
  <div class="stock-list">

    <!-- 沪深300成分股列表 -->
    <div class="stocks-section">
      <div class="section-header">
        <h2 class="section-title">股票列表</h2>
        <el-button type="primary" @click="showAddStockDialog" class="add-stock-button" size="large">
          <el-icon style="margin-right: 5px"><Plus /></el-icon>
          添加股票
        </el-button>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <span class="market-label">市场：</span>
        <el-select v-model="selectedMarket" placeholder="选择市场" class="market-select" size="large" @change="handleMarketChange">
          <el-option label="全部" value="" />
          <el-option v-for="option in marketOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索股票代码或名称"
          clearable
          @blur="handleSearchBlur"
          @clear="handleSearchClear"
          class="search-input"
          size="large"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearchButton" class="search-button" size="large">
          <el-icon style="margin-right: 5px"><Search /></el-icon>
          搜索
        </el-button>
      </div>
      
      <el-table :data="hs300Stocks" class="stocks-table" v-loading="loadingStocks" :row-class-name="tableRowClassName">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="股票代码" width="150" />
        <el-table-column label="股票名称">
          <template #default="{ row }">
            <a :href="getStockLink(row)" target="_blank" rel="noopener noreferrer" class="stock-name-link">
              {{ row.name }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="市场" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.market_type === 'A'" type="success">A股</el-tag>
            <el-tag v-else-if="row.market_type === 'US'" type="warning">美股</el-tag>
            <el-tag v-else-if="row.market_type === 'HK'" type="danger">港股</el-tag>
            <el-tag v-else>{{ row.market_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button @click="goToAnalysis(row)" type="primary" plain>
              分析
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
          :total="totalStocks"
          prev-text="《"
          next-text="》"
          jumper-text="前往"
          :page-size-label="'每页'"
          :total-label="'共'"
          :pager-count="5"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加股票对话框 -->
    <el-dialog v-model="addStockDialogVisible" title="添加股票" width="500px">
      <el-form :model="addStockForm" label-width="80px">
        <el-form-item label="市场类型">
          <el-select v-model="addStockForm.market_type" placeholder="请选择市场类型" @change="handleMarketTypeChange">
            <el-option v-for="option in marketOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="股票代码">
          <el-input v-model="addStockForm.code" :placeholder="codePlaceholder" />
        </el-form-item>
        <el-form-item label="股票名称">
          <el-input v-model="addStockForm.name" placeholder="请输入股票名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddStock" :loading="addingStock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import api from '../api';
import { getStockLink } from '../utils/stockUtils';
import { marketOptions } from '../data/constants';

export default {
  name: 'StockList',
  components: {
    Search,
    Plus
  },
  setup() {
    const router = useRouter();
    
    const hs300Stocks = ref([]);
    const loadingStocks = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalStocks = ref(0);
    const searchQuery = ref('');
    const selectedMarket = ref('');
    const addStockDialogVisible = ref(false);
    const addingStock = ref(false);
    const addStockForm = ref({
      code: '',
      name: '',
      market_type: 'A'
    });

    const codePlaceholder = computed(() => {
      if (addStockForm.value.market_type === 'A') {
        return '例如: sh.600000 或 sz.000001';
      } else if (addStockForm.value.market_type === 'HK') {
        return '例如: 00700';
      } else if (addStockForm.value.market_type === 'US') {
        return '例如: AAPL';
      }
      return '请输入股票代码';
    });

    const handleMarketTypeChange = () => {
      addStockForm.value.code = '';
    };

    const showAddStockDialog = () => {
      addStockForm.value = {
        code: '',
        name: '',
        market_type: 'A'
      };
      addStockDialogVisible.value = true;
    };

    const handleAddStock = async () => {
      if (!addStockForm.value.code || !addStockForm.value.name) {
        ElMessage.warning('请输入股票代码和名称');
        return;
      }
      
      addingStock.value = true;
      try {
        const result = await api.stocks.addStock(
          addStockForm.value.code,
          addStockForm.value.name,
          addStockForm.value.market_type
        );
        
        if (result.success) {
          ElMessage.success('股票添加成功');
          addStockDialogVisible.value = false;
          loadHS300Stocks();
        } else {
          ElMessage.error(result.message || '添加股票失败');
        }
      } catch (error) {
        ElMessage.error('添加股票失败: ' + error.message);
      } finally {
        addingStock.value = false;
      }
    };

    const loadHS300Stocks = async () => {
      loadingStocks.value = true;
      console.log('加载股票列表参数:', {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value || null,
        market: selectedMarket.value || null
      });
      const result = await api.stocks.getStockList(
        currentPage.value, 
        pageSize.value,
        searchQuery.value || null,
        selectedMarket.value || null
      );
      hs300Stocks.value = result.items || [];
      totalStocks.value = result.total || 0;
      loadingStocks.value = false;
    };

    const handleSearchButton = () => {
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadHS300Stocks();
    };

    const handleMarketChange = (value) => {
      console.log('市场选择变化:', value);
      currentPage.value = 1;
    };

    const handleSearchBlur = () => {
      searchQuery.value = searchQuery.value.trim();
    };

    const handleSearchClear = () => {
      searchQuery.value = '';
    };

    const goToAnalysis = (stock) => {
      router.push({
        name: 'analysis',
        params: {
          code: stock.code,
          name: stock.name
        }
      });
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      loadHS300Stocks();
    };

    const handleCurrentChange = (current) => {
      currentPage.value = current;
      loadHS300Stocks();
    };

    const tableRowClassName = ({ rowIndex }) => {
      return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
    };



    onMounted(() => {
      loadHS300Stocks();
    });

    return {
      hs300Stocks,
      loadingStocks,
      currentPage,
      pageSize,
      totalStocks,
      searchQuery,
      selectedMarket,
      addStockDialogVisible,
      addingStock,
      addStockForm,
      codePlaceholder,
      handleMarketTypeChange,
      showAddStockDialog,
      handleAddStock,
      loadHS300Stocks,
      handleSearchButton,
      handleMarketChange,
      handleSearchBlur,
      handleSearchClear,
      handleSizeChange,
      handleCurrentChange,
      goToAnalysis,
      tableRowClassName,
      marketOptions,
      getStockLink
    };
  }
};
</script>

<style scoped>
.stock-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
}



.stocks-section {
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

.search-container {
  margin-bottom: 2rem;
  max-width: 1000px;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
}

.market-label {
  font-weight: 500;
  white-space: nowrap;
}

.market-select {
  width: 120px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.market-select :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none;
}

.market-select:focus-within {
  border-color: #45b7d1;
  box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
}

.search-input {
  flex: 1;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: none;
}

.search-input:focus-within {
  border-color: #45b7d1;
  box-shadow: 0 0 0 3px rgba(69, 183, 209, 0.1);
}

.search-icon {
  color: #95a5a6;
  transition: color 0.3s ease;
}

.search-input:focus-within .search-icon {
  color: #45b7d1;
}

.search-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 1.5rem;
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.add-stock-button {
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  padding: 0 1.5rem;
  transition: all 0.3s ease;
}

.add-stock-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(69, 183, 209, 0.3);
}

.stocks-table {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.stocks-table :deep(.even-row) {
  background-color: #f9fafb;
}

.stocks-table :deep(.odd-row) {
  background-color: #ffffff;
}

.stock-name-link {
  color: #45b7d1;
  text-decoration: none;
}

.stock-name-link:hover {
  text-decoration: underline;
  color: #3091b1;
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
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
    padding: 0.8rem;
  }
  
  .market-select {
    width: 100%;
    height: 40px;
  }
  
  .search-input {
    width: 100%;
    height: 40px;
  }
  
  .search-button {
    width: 100%;
    height: 40px;
  }
  
  .add-stock-button {
    width: 100%;
    height: 40px;
  }
  
  .el-table {
    font-size: 0.9rem;
  }
  
  .el-table-column {
    width: auto !important;
  }
  
  .el-table-column:nth-child(1) {
    min-width: 120px;
  }
  
  .el-table-column:nth-child(2) {
    flex: 1;
  }
  
  .el-table-column:nth-child(3) {
    min-width: 100px;
  }
  
  .el-button {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
  }
  
  .pagination-container {
    margin-top: 1rem;
  }

  .el-pagination {
    font-size: 0.8rem;
  }

  /* 限制显示的页码数量 */
  .el-pagination :deep(.el-pagination__pages) {
    max-width: 200px;
  }

  .el-pagination :deep(.el-pagination__item) {
    margin: 0 1px;
    min-width: 24px;
    height: 24px;
    line-height: 24px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .search-container {
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
  
  /* 限制显示的页码数量 */
  .el-pagination :deep(.el-pagination__pages) {
    max-width: 200px;
  }
  
  .el-pagination :deep(.el-pagination__item) {
    margin: 0 1px;
    min-width: 24px;
    height: 24px;
    line-height: 24px;
  }
}
</style>
