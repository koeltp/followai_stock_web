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

  // 获取股票历史数据（用于K线图）
  getStockHistory: async (code, startDate = null, endDate = null) => {
    try {
      const params = { code };
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }
      const response = await apiClient.get('/stocks/history', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting stock history:', error);
      return { code, data: [] };
    }
  }
};

export default stocksApi;