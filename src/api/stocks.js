import apiClient from './axios';

const stocksApi = {
  // 获取沪深300成分股（支持分页和搜索）
  getHS300Stocks: async (page = 1, pageSize = 10, search = null) => {
    try {
      const params = { page, page_size: pageSize };
      if (search) {
        params.search = search;
      }
      const response = await apiClient.get('/stocks/hs300', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting HS300 stocks:', error);
      return { total: 0, items: [] };
    }
  },

  // 获取所有股票列表（支持分页和搜索）
  getStockList: async (page = 1, pageSize = 10, search = null, market = null) => {
    try {
      const params = { page, page_size: pageSize };
      if (search) {
        params.search = search;
      }
      if (market) {
        params.market = market;
      }
      console.log('API调用参数:', params);
      const response = await apiClient.get('/stocks/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting stock list:', error);
      return { total: 0, items: [] };
    }
  },

  // 添加股票
  addStock: async (code, name, marketType = 'A') => {
    try {
      const response = await apiClient.post('/stocks/add', {
        code,
        name,
        market_type: marketType
      });
      return response.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      return { success: false, message: error.message };
    }
  },

  // 同步股票历史数据
  syncStock: async (code, marketType = 'A', startDate = null, endDate = null) => {
    try {
      const response = await apiClient.post('/stocks/sync', {
        code,
        market_type: marketType,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing stock:', error);
      return { success: false, message: error.message };
    }
  }
};

export default stocksApi;