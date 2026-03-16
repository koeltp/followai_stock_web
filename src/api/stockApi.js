import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const stockApi = {
  // 获取沪深300成分股（支持分页和搜索）
  getHS300Stocks: async (page = 1, pageSize = 10, search = null) => {
    try {
      const params = { page, page_size: pageSize };
      if (search) {
        params.search = search;
      }
      const response = await axios.get(`${API_BASE_URL}/stocks/hs300`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting HS300 stocks:', error);
      return { total: 0, items: [] };
    }
  },

  // 获取单只股票威科夫分析
  analyzeStock: async (code, startDate, endDate) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/wyckoff/analysis`, {
        params: { code, start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing stock:', error);
      return null;
    }
  },

  // 执行威科夫筛选
  screening: async (startDate, endDate, minConfidence = 0.7) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/stocks/wyckoff/screening`, {
        start_date: startDate,
        end_date: endDate,
        min_confidence: minConfidence
      });
      return response.data;
    } catch (error) {
      console.error('Error screening stocks:', error);
      return null;
    }
  },

  // 获取筛选历史
  getScreeningHistory: async (limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stocks/wyckoff/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting screening history:', error);
      return [];
    }
  },

  // 健康检查
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return null;
    }
  },

  // 获取分析历史（支持搜索和日期范围）
  getAnalysisHistory: async (code = null, page = 1, pageSize = 10, search = null, startDate = null, endDate = null) => {
    try {
      const params = { page, page_size: pageSize };
      if (code) {
        params.code = code;
      }
      if (search) {
        params.search = search;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }
      console.log('API Request Params:', params);
      const response = await axios.get(`${API_BASE_URL}/stocks/wyckoff/analysis-history`, {
        params
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting analysis history:', error);
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
      const response = await axios.get(`${API_BASE_URL}/stocks/history`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting stock history:', error);
      return { code, data: [] };
    }
  },

  // 获取所有配置
  getConfigs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/config`);
      return response.data;
    } catch (error) {
      console.error('Error getting configs:', error);
      return { configs: [] };
    }
  },

  // 更新配置
  updateConfig: async (config) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/config`, config);
      return response.data;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }
};

export default stockApi;