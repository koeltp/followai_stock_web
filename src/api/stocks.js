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


};

export default stocksApi;