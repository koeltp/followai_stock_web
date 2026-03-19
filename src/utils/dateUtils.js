// 日期相关工具函数

/**
 * 获取日期快捷选项
 * @returns {Array} 日期快捷选项数组
 */
export const getDateShortcuts = () => {
  return [
    {
      text: '近7天',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        return [start, end];
      }
    },
    {
      text: '近30天',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
        return [start, end];
      }
    },
    {
      text: '近90天',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
        return [start, end];
      }
    },
    {
      text: '近一年',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
        return [start, end];
      }
    },
    {
      text: '今年',
      value: () => {
        const end = new Date();
        const start = new Date(new Date().getFullYear(), 0, 1);
        return [start, end];
      }
    }
  ];
};