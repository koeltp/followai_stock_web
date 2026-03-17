import apiClient from './axios';

const wyckoffApi = {
  // 获取单只股票威科夫分析
  analyzeStock: async (code, startDate, endDate) => {
    try {
      const response = await apiClient.get('/stocks/wyckoff/analysis', {
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
      const response = await apiClient.post('/stocks/wyckoff/screening', {
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
      const response = await apiClient.get('/stocks/wyckoff/history', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting screening history:', error);
      return [];
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
      const response = await apiClient.get('/stocks/wyckoff/analysis-history', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting analysis history:', error);
      return { total: 0, items: [] };
    }
  },

  // 获取分析日志（支持搜索和日期范围）
  getAnalysisLogs: async (code = null, page = 1, pageSize = 10, search = null, startDate = null, endDate = null) => {
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
      const response = await apiClient.get('/stocks/wyckoff/analysis-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting analysis logs:', error);
      return { total: 0, items: [] };
    }
  },

  // 重新解析分析日志
  reparseLog: async (logId) => {
    try {
      const response = await apiClient.post(`/stocks/wyckoff/reparse/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Error reparsing log:', error);
      throw error;
    }
  }
};

export default wyckoffApi;