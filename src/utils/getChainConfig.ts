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
    SIPFactory: "0x99d972ac25d5Db3D3eAE8AA5F71Da8b4814D0c36",
    RebalancerFactory: "0xb62D27fAB75d978b357C0cC519297795E3a474dC",
    SocketFactory: "0x6B7Bf9294994EA18Fff9cb13d5dDBa1a21c8deb1",
    InsuranceDeployer: "0xde5fcC14C6B6ff4B1ab937a258F2Cc38577FFDaa",
    rpcUrl: process.env.REACT_APP_MUMBAI_RPC_URL!,
  };
};
