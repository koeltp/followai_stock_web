<template>
  <div class="stock-list">

    <!-- 沪深300成分股列表 -->
    <div class="stocks-section">
      <h2 class="section-title">股票列表</h2>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索股票代码或名称"
          clearable
          @input="handleSearchInput"
          @blur="handleSearchBlur"
          @clear="handleSearchClear"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-table :data="hs300Stocks" class="stocks-table" v-loading="loadingStocks" :row-class-name="tableRowClassName">
        <el-table-column prop="code" label="股票代码" width="150" />
        <el-table-column label="股票名称">
          <template #default="{ row }">
            <a :href="`https://stockpage.10jqka.com.cn/${row.code.replace(/^[a-z]+\./i, '')}/`" target="_blank" rel="noopener noreferrer" class="stock-name-link">
              {{ row.name }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import api from '../api';

export default {
  name: 'StockList',
  components: {
    Search
  },
  setup() {
    const router = useRouter();
    
    const hs300Stocks = ref([]);
    const loadingStocks = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalStocks = ref(0);
    const searchQuery = ref('');

    // 加载沪深300成分股
    const loadHS300Stocks = async () => {
      loadingStocks.value = true;
      const result = await api.stocks.getHS300Stocks(
        currentPage.value, 
        pageSize.value,
        searchQuery.value || null
      );
      hs300Stocks.value = result.items || [];
      totalStocks.value = result.total || 0;
      loadingStocks.value = false;
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
        loadHS300Stocks();
      }, 300);
    };

    // 处理搜索按钮点击
    const handleSearchButton = () => {
      // 去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadHS300Stocks();
    };

    // 处理光标失焦
    const handleSearchBlur = () => {
      // 光标失焦时执行搜索，去除前后空格
      searchQuery.value = searchQuery.value.trim();
      currentPage.value = 1;
      loadHS300Stocks();
    };

    // 处理搜索清空
    const handleSearchClear = () => {
      searchQuery.value = '';
      currentPage.value = 1;
      loadHS300Stocks();
    };

    // 跳转到分析页面
    const goToAnalysis = (stock) => {
      router.push({
        name: 'analysis',
        params: {
          code: stock.code,
          name: stock.name
        }
      });
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      loadHS300Stocks();
    };

    // 处理页码变化
    const handleCurrentChange = (current) => {
      currentPage.value = current;
      loadHS300Stocks();
    };

    // 表格行样式类名
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
      loadHS300Stocks,
      handleSearchInput,
      handleSearchButton,
      handleSearchBlur,
      handleSearchClear,
      goToAnalysis,
      handleSizeChange,
      handleCurrentChange,
      tableRowClassName
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

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
}

.search-container {
  margin-bottom: 2rem;
  max-width: 400px;
}

.search-input {
  width: 100%;
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
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-input {
    width: 100%;
  }
  
  .search-button {
    width: 100%;
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
