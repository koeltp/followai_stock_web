export const getStockLink = (stock) => {
  if (!stock || !stock.code) {
    return '#';
  }
  
  let code = stock.code;
  // 港股/美股使用 LongPort 链接
  if (code.endsWith('.US') || code.endsWith('.HK')) {
    return `https://longportapp.com/zh-CN/quote/${code}`;
  } else {
    code = code.replace(/^[a-z]+\./i, '');
    return `https://stockpage.10jqka.com.cn/${code}/`;
  }
};
