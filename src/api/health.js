import apiClient from './axios';

const healthApi = {
  // 健康检查
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return null;
    }
  }
};

export default healthApi;