import { ethers } from 'ethers';

export const networkMap = {
  MAINNET: {
    chainId: ethers.utils.hexValue(1), // '0x1'
  },
  POLYGON_MAINNET: {
    chainId: ethers.utils.hexValue(137), // '0x89'
    chainName: 'Matic (Polygon) Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://www.polygonscan.com/'],
  },
};
