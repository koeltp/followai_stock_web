import stocksApi from './stocks';
import wyckoffApi from './wyckoff';
import configApi from './config';
import healthApi from './health';

const api = {
  stocks: stocksApi,
  wyckoff: wyckoffApi,
  config: configApi,
  health: healthApi
};

export default api;