import { useEffect, useState } from "react";
import { SafeEventEmitterProvider, UserInfo } from "@web3auth/base";
import { ethers } from "ethers";
import { SIPFactory } from "./constants";
import { Loading } from "./components/Loading";
import { getChainConfig } from "./utils";
import {
  GaslessOnboarding,
  GaslessWalletConfig,
  GaslessWalletInterface,
  LoginConfig,
} from "@gelatonetwork/gasless-onboarding";
import "./App.css";
function App() {
  const [SIPConfig, setSIPConfig] = useState<{
    chainId: number;
    target: string;
  }>();
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
  const [user, setUser] = useState<Partial<UserInfo> | null>(null);
  const [wallet, setWallet] = useState<{
    address: string;
    balance: string;
    chainId: number;
  } | null>(null);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);

  const increment = async () => {
    if (!SIPFactoryContract) {
      return;
    }
    let { data } = await SIPFactoryContract.populateTransaction.createSIP(
      "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f",
      "0xefa725a5df23b6836ee9660af6477d664bb0818b",
      "1000000000000000000"
    );
    if (!data) {
      return;
    }
    if (!smartWallet) {
      return;
    }
    try {
      const { taskId } = await smartWallet.sponsorTransaction(
        SIPConfig?.target!,
        data
      );
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
        const { apiKey, chainId, target, rpcUrl, name } =
          getChainConfig(chainIdParam);
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
        setSIPConfig({ chainId, target });
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
        SIPConfig?.target!,
        SIPFactory,
        new ethers.providers.Web3Provider(web3AuthProvider!).getSigner()
      );
      setSIPFactoryContract(SIP);
      const fetchStatus = async () => {
        if (!SIPFactoryContract || !gelatoSmartWallet) {
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

  const loggedInView = isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col h-full w-[700px] gap-2 py-10">
      {smartWallet?.isInitiated() && (
        <div className="flex justify-center flex-col gap-10">
          <button onClick={increment}>Call</button>
        </div>
      )}
    </div>
  );

  const toLoginInView = (
    <div className="flex justify-center flex-col items-center h-full w-full gap-10">
      <p className="text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#b45f63] to-[#f5c3a6]">
        Account Abstraction PoC
      </p>

      <div className="h-12">
        {!isLoading && (
          <button
            onClick={login}
            className="px-4 border-2 border-[#b45f63] rounded-lg"
          >
            <p className="px-4 py-1 font-semibold text-gray-800 text-lg">
              Login
            </p>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {web3AuthProvider && (
        <div className="flex justify-between p-5 gap-5 items-center">
          <button onClick={logout} className="px-4 py-1 border-2 ">
            <p className="font-semibold text-gray-800 text-lg">Logout</p>
          </button>
        </div>
      )}
      <div className="flex h-screen px-20 justify-center">
        {web3AuthProvider ? loggedInView : toLoginInView}
      </div>
    </>
  );
}

export default App;
