export const SUPPORTED_NETWORKS: {name: string; chainId: number}[] = [
  {name: "Mumbai", chainId: 80001},
];

export const getChainConfig = (
  chainId: string | null
): {
  name: string;
  chainId: number;
  SIPFactory: string;
  RebalancerFactory: string;
  SocketFactory: string;
  InsuranceDeployer: string;
  apiKey: string;
  rpcUrl: string;
} => {
  return {
    name: "Mumbai",
    apiKey: process.env.REACT_APP_SPONSOR_API_KEY!,
    chainId: 80001,
    SIPFactory: "0x411f8Ce317d7be30f3639cff9D1f4A0EF8EecD93",
    RebalancerFactory: "0xb62D27fAB75d978b357C0cC519297795E3a474dC",
    SocketFactory: "0x87A5A2E29cB8DB7D7622CFc2A01478C92049E5f7",
    InsuranceDeployer: "0xde5fcC14C6B6ff4B1ab937a258F2Cc38577FFDaa",
    rpcUrl: process.env.REACT_APP_MUMBAI_RPC_URL!,
  };
};
