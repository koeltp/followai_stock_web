import apiClient from './axios';

const configApi = {
  // 获取所有配置
  getConfigs: async () => {
    try {
      const response = await apiClient.get('/config');
      return response.data;
    } catch (error) {
      console.error('Error getting configs:', error);
      return { configs: [] };
    }
  },

  // 更新配置
  updateConfig: async (config) => {
    try {
      const response = await apiClient.post('/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }
};

export default configApi;