import stocksApi from './stocks';
import wyckoffApi from './wyckoff';
import configApi from './config';

const api = {
  stocks: stocksApi,
  wyckoff: wyckoffApi,
  config: configApi
};

export default api;