export const shortAddress = (addr, offset = 4) =>
  addr ? addr.substring(0, 6 + offset) + '...' + addr.substring(addr.length - (4 + offset)) : null;

export const fetcher = (url) => fetch(url).then((r) => r.json());
