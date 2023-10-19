import { useEffect, useState } from "react";
import { SafeEventEmitterProvider, UserInfo } from "@web3auth/base";
import { ethers, Contract } from "ethers";
import {
  SIPFactoryABI,
  SocketFactoryABI,
  RebalancerFactoryABI,
  socketABI,
  cfaABI,
  insuranceDeployerABI,
  insuranceBond,
} from "../constants";
import { Loading } from "../components/Loading";
import { getChainConfig } from "../utils";
import {
  GaslessOnboarding,
  GaslessWalletConfig,
  GaslessWalletInterface,
  LoginConfig,
} from "@gelatonetwork/gasless-onboarding";
import "../App.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SIPCard from "../components/SIP";
import { calculateFlowRate } from "../utils/createFlow";
import TokenBuyForm from "../components/socket";
import SocketHistory from "../components/socketHistory";
import PortfolioRebalancer from "../components/portfolioRebalancer";
import RebalanceHistory from "../components/rebalancerHistory";
import SIPHistory from "../components/sipHistory";
import CreateBond from "../components/assetInsurance";
import InsuranceHistory from "../components/insuranceHistory";
import RebalanceHistory1 from "../components/marketplace";
import InsuranceDeployed from "../components/marketplace";

function Home() {
  const [contractsConfig, setContractsConfig] = useState<
    | {
        chainId: number;
        SIPFactory?: string;
        SocketFactory?: string;
        RebalancerFactory?: string;
        InsuranceDeployer?: string;
      }
    | undefined
  >(undefined);

  const [currentChain, setCurrentChain] = useState<{
    id: number;
    name: string;
  }>();
  const [gelatoLogin, setGelatoLogin] = useState<
    GaslessOnboarding | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [web3AuthProvider, setWeb3AuthProvider] =
    useState<SafeEventEmitterProvider | null>(null);
  const [smartWallet, setSmartWallet] = useState<GaslessWalletInterface | null>(
    null
  );
  const [SIPFactoryContract, setSIPFactoryContract] =
    useState<ethers.Contract | null>(null);
  const [socketFactory, setSocketFactory] = useState<ethers.Contract | null>(
    null
  );
  const [insuranceFactory, setInsuranceFactory] =
    useState<ethers.Contract | null>(null);
  const [rebalancerFactory, setRebalancerFactory] =
    useState<ethers.Contract | null>(null);
  const [user, setUser] = useState<Partial<UserInfo> | null>(null);
  const [wallet, setWallet] = useState<{
    address: string;
    balance: string;
    chainId: number;
  } | null>(null);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const approveXtoken = async () => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const fdaixaddress = "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f";
    const CFAv3address = "0xcfA132E353cB4E398080B9700609bb008eceB125";

    const cfaV3 = new ethers.Contract(
      CFAv3address,
      cfaABI,
      new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
    );
    let { data } =
      await cfaV3.populateTransaction.updateFlowOperatorPermissions(
        fdaixaddress,
        contractsConfig?.SIPFactory,
        "7",
        "2178321882175756675765"
      );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        CFAv3address,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const approveSupertoken = async (spender: string): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const fdaixaddress = "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f";
    const CFAv3address = "0xcfA132E353cB4E398080B9700609bb008eceB125";

    const cfaV3 = new ethers.Contract(
      CFAv3address,
      cfaABI,
      new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
    );
    let { data } =
      await cfaV3.populateTransaction.updateFlowOperatorPermissions(
        fdaixaddress,
        spender,
        "7",
        "2178321882175756675765"
      );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        CFAv3address,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };

  const approveERC20 = async (
    tokenAddress: string,
    contractAddress: string
  ): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const abi = [
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
    const signer = web3Provider.getSigner();
    const erc20 = new Contract(tokenAddress, abi, signer);

    try {
      const { data } = await erc20.populateTransaction.approve(
        contractAddress,
        "217832144882175756675765"
      );

      if (!data) {
        return;
      }

      if (!smartWallet) {
        return;
      }

      const { taskId } = await smartWallet.sponsorTransaction(
        tokenAddress,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const depositAllTokens = async (contractAddress: string): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const abi = [
      {
        inputs: [],
        name: "depositTokens",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
    const signer = web3Provider.getSigner();
    const contract = new Contract(contractAddress, abi, signer);

    try {
      const { data } = await contract.populateTransaction.depositTokens();

      if (!data) {
        return;
      }

      if (!smartWallet) {
        return;
      }

      const { taskId } = await smartWallet.sponsorTransaction(
        contractAddress,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const withdrawAllTokens = async (contractAddress: string): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const abi = [
      {
        inputs: [],
        name: "withdrawTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
    const signer = web3Provider.getSigner();
    const contract = new Contract(contractAddress, abi, signer);

    try {
      const { data } = await contract.populateTransaction.withdrawTokens();

      if (!data) {
        return;
      }

      if (!smartWallet) {
        return;
      }

      const { taskId } = await smartWallet.sponsorTransaction(
        contractAddress,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const buyInsurance = async (contractAddress: string): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const abi = [
      {
        constant: false,
        inputs: [],
        name: "buyInsurance",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
    const signer = web3Provider.getSigner();
    const contract = new Contract(contractAddress, abi, signer);

    try {
      const { data } = await contract.populateTransaction.buyInsurance();

      if (!data) {
        return;
      }

      if (!smartWallet) {
        return;
      }

      const { taskId } = await smartWallet.sponsorTransaction(
        contractAddress,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const approveAllTokens = async (
    assetAddresses: string[],
    contractAddress: string
  ): Promise<void> => {
    if (!gelatoLogin || !web3AuthProvider) {
      return;
    }

    const abi = [
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
    const signer = web3Provider.getSigner();
    for (const token of assetAddresses) {
      console.log(token);
      const erc20 = new Contract(token, abi, signer);

      try {
        const { data } = await erc20.populateTransaction.approve(
          contractAddress,
          "217832144882175756675765"
        );

        if (!data) {
          return;
        }

        if (!smartWallet) {
          return;
        }

        const { taskId } = await smartWallet.sponsorTransaction(token, data);
        console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
      } catch (error) {
        console.log("error");
      }
    }
  };

  const createSIP = async (
    buyToken: string,
    sellToken: string,
    numberOfTokens: number | null,
    frequency: number | null
  ) => {
    if (!SIPFactoryContract) {
      return;
    }

    const calculatedFlowRate = calculateFlowRate(numberOfTokens);
    console.log(calculatedFlowRate);
    let { data } = await SIPFactoryContract!.populateTransaction.createSIP(
      sellToken,
      buyToken,
      String(frequency),
      sellToken,
      String(calculatedFlowRate)
    );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        contractsConfig?.SIPFactory!,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const createVault = async (
    tokenAddresses: string[],
    targetWeights: number[],
    priceFeedAddresses: string[],
    portfolioValue: number,
    interval: number
  ) => {
    if (!rebalancerFactory) {
      return;
    }

    let { data } =
      await rebalancerFactory!.populateTransaction.createPortfolioRebalancer(
        tokenAddresses,
        targetWeights,
        priceFeedAddresses,
        portfolioValue,
        interval
      );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        contractsConfig?.RebalancerFactory!,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const createSocket = async (
    buyToken: string,
    sellToken: string,
    numberOfTokens: number | null
  ) => {
    if (!SIPFactoryContract) {
      return;
    }

    let { data } = await socketFactory!.populateTransaction.createTask(
      sellToken,
      buyToken,
      numberOfTokens
    );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        contractsConfig?.SocketFactory!,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const createInsurance = async (
    threshold: string,
    superToken: string,
    assetInsured: String,
    insuranceAmt: String,
    tokenAddress: string,
    flowRate: string
  ) => {
    if (!insuranceFactory) {
      return;
    }

    let { data } = await insuranceFactory!.populateTransaction.createInsurance(
      threshold,
      superToken,
      assetInsured,
      insuranceAmt,
      tokenAddress,
      flowRate
    );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        contractsConfig?.InsuranceDeployer!,
        data
      );
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };
  const depositTokensInsurance = async (address: string) => {
    if (!SIPFactoryContract) {
      return;
    }
    console.log(address);
    const insuranceBondEthers = new ethers.Contract(
      address,
      insuranceBond,
      new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
    );

    let { data } =
      await insuranceBondEthers!.populateTransaction.depositInsuredAmount();
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(address, data);
      console.log(`https://api.gelato.digital/tasks/status/${taskId}`);
    } catch (error) {
      console.log("error");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const chainIdParam = queryParams.get("chainId");
        const {
          apiKey,
          chainId,
          SIPFactory,
          RebalancerFactory,
          SocketFactory,
          InsuranceDeployer,
          rpcUrl,
          name,
        } = getChainConfig(chainIdParam);
        setCurrentChain({ name, id: chainId });
        const smartWalletConfig: GaslessWalletConfig = { apiKey };
        const loginConfig: LoginConfig = {
          domains: [window.location.origin],
          chain: {
            id: chainId,
            rpcUrl,
          },
          ui: {
            theme: "dark",
          },
          openLogin: {
            redirectUrl: `${window.location.origin}/?chainId=${chainId}`,
          },
        };
        const gelatoLogin = new GaslessOnboarding(
          loginConfig,
          smartWalletConfig
        );
        setContractsConfig({
          chainId,
          SIPFactory,
          SocketFactory,
          RebalancerFactory,
          InsuranceDeployer,
        });
        await gelatoLogin.init();
        setGelatoLogin(gelatoLogin);
        const provider = gelatoLogin.getProvider();
        if (provider) {
          setWeb3AuthProvider(provider);
        }
      } catch (error) {
        console.log("error");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!gelatoLogin || !web3AuthProvider) {
        return;
      }
      setIsLoading(true);
      const web3Provider = new ethers.providers.Web3Provider(web3AuthProvider!);
      const signer = web3Provider.getSigner();
      setWallet({
        address: await signer.getAddress(),
        balance: (await signer.getBalance()).toString(),
        chainId: await signer.getChainId(),
      });
      const user = await gelatoLogin.getUserInfo();
      setUser(user);
      const gelatoSmartWallet = gelatoLogin.getGaslessWallet();
      setSmartWallet(gelatoSmartWallet);
      setIsDeployed(await gelatoSmartWallet.isDeployed());
      const SIP = new ethers.Contract(
        contractsConfig?.SIPFactory!,
        SIPFactoryABI,
        new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
      );
      setSIPFactoryContract(SIP);
      const Socket = new ethers.Contract(
        contractsConfig?.SocketFactory!,
        SocketFactoryABI,
        new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
      );
      setSocketFactory(Socket);
      const insurance = new ethers.Contract(
        contractsConfig?.InsuranceDeployer!,
        insuranceDeployerABI,
        new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
      );
      setInsuranceFactory(insurance);
      const Rebalancer = new ethers.Contract(
        contractsConfig?.RebalancerFactory!,
        RebalancerFactoryABI,
        new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
      );
      setRebalancerFactory(Rebalancer);
      const fetchStatus = async () => {
        if (
          !SIPFactoryContract ||
          !rebalancerFactory ||
          !socketFactory ||
          !insuranceFactory ||
          !gelatoSmartWallet
        ) {
          return;
        }

        setIsDeployed(await gelatoSmartWallet.isDeployed());
      };
      await fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      setIsLoading(false);
      return () => clearInterval(interval);
    };
    init();
  }, [web3AuthProvider]);

  const login = async () => {
    if (!gelatoLogin) {
      return;
    }
    const web3authProvider = await gelatoLogin.login();
    setWeb3AuthProvider(web3authProvider);
    console.log("logged in");
  };

  const logout = async () => {
    if (!gelatoLogin) {
      return;
    }
    await gelatoLogin.logout();
    setWeb3AuthProvider(null);
    setWallet(null);
    setUser(null);
    setSmartWallet(null);
    setSIPFactoryContract(null);
  };

  const loggedInView = (
    <div className="bg-base-200">
      <Navbar
        action={logout}
        type={"Logout"}
        loading={isLoading}
        wallet={smartWallet?.getAddress()!}
      />
      <Hero login={login} wallet={web3AuthProvider} loading={isLoading} />
      <div className="min-h-[100vh]">
        {" "}
        <CreateBond createInsurance={createInsurance} />
        <InsuranceHistory
          user={smartWallet?.getAddress()!}
          deposit={depositTokensInsurance}
          approve={approveERC20}
        />
        <InsuranceDeployed
          user={smartWallet?.getAddress()!}
          approve={approveSupertoken}
          buy={buyInsurance}
        />
      </div>
      <div className="min-h-[100vh]">
        <PortfolioRebalancer createPortfolioRebalancer={createVault} />
        <RebalanceHistory
          user={smartWallet?.getAddress()!}
          approve={approveAllTokens}
          deposit={depositAllTokens}
          withdraw={withdrawAllTokens}
        />
      </div>
      <div className="min-h-[100vh]">
        <SIPCard
          buy={createSIP}
          approve={approveXtoken}
          loading={smartWallet?.isInitiated()}
        />
        <SIPHistory user={smartWallet?.getAddress()!} />
      </div>{" "}
      <div className="min-h-[100vh]">
        <TokenBuyForm buy={createSocket} loading={smartWallet?.isInitiated()} />
        <SocketHistory
          user={smartWallet?.getAddress()!}
          approve={approveERC20}
        />
      </div>
    </div>
  );

  const toLoginInView = (
    <div>
      <Navbar
        action={login}
        type={"Login"}
        loading={isLoading}
        wallet={smartWallet?.getAddress()!}
      />

      <Hero login={login} wallet={web3AuthProvider} loading={isLoading} />
    </div>
  );

  return (
    <>
      <div className="bg-base-200">
        {web3AuthProvider ? loggedInView : toLoginInView}
      </div>
    </>
  );
}

export default Home;
