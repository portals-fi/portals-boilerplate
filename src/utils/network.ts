interface INetworkInfo {
  [key: string]: {
    chainId: number;
    rpcUrls: string[];
    name: string;
    currency: { name: string; decimals: number; symbol: string };
    explorer: string;
  };
}

export const NETWORK_INFO: INetworkInfo = {
  ethereum: {
    chainId: 1,
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    currency: { name: "eth", decimals: 18, symbol: "ETH" },
    name: "Ethereum Mainnet",
    explorer: "https://etherscan.io/",
  },
  polygon: {
    chainId: 137,
    rpcUrls: ["https://polygon-rpc.com/"],
    currency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
    name: "Polygon Mainnet",
    explorer: "https://polygonscan.com/",
  },
  bsc: {
    chainId: 56,
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    currency: { name: "BNB", decimals: 18, symbol: "BNB" },
    name: "Binance Smart Chain",
    explorer: "https://bscscan.com",
  },
  avalanche: {
    chainId: 43114,
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    currency: { name: "AVAX", decimals: 18, symbol: "AVAX" },
    name: "Avalanche Network",
    explorer: "https://snowtrace.io/",
  },
  fantom: {
    chainId: 250,
    rpcUrls: ["https://rpc.ftm.tools/", "https://rpcapi.fantom.network"],
    currency: { name: "FTM", decimals: 18, symbol: "FTM" },
    name: "Fantom Opera",
    explorer: "https://ftmscan.com/",
  },
  optimism: {
    chainId: 10,
    rpcUrls: ["https://mainnet.optimism.io"],
    currency: { name: "ETH", decimals: 18, symbol: "ETH" },
    name: "Optimism",
    explorer: "https://optimistic.etherscan.io/",
  },
  arbitrum: {
    chainId: 42161,
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    currency: { name: "ETH", decimals: 18, symbol: "ETH" },
    name: "Arbitrum One",
    explorer: "https://arbiscan.io/",
  },
};
