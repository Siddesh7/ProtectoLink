export const SUPPORTED_NETWORKS: { name: string; chainId: number }[] = [
  { name: "Mumbai", chainId: 80001 },
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
    SIPFactory: "0x0f1eAdb933A19dE5899ac427d1Ffee14f44c9251",
    RebalancerFactory: "0x7524E1eD4943A6a01c03CDFF7F79E14655296d13",
    SocketFactory: "0x245a36D23cba264055ACD839330Adcb848be4475",
    InsuranceDeployer: "0xde5fcC14C6B6ff4B1ab937a258F2Cc38577FFDaa",
    rpcUrl: process.env.REACT_APP_MUMBAI_RPC_URL!,
  };
};
