import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {getChainConfig} from "../utils";
import {SIPFactoryABI, sipABI} from "../constants";
import getTokenName from "../utils/getTokenName";

interface SIPHistoryProps {
  user: string;
}

const SIPHistory: React.FC<SIPHistoryProps> = ({user}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [targetTokens, setTargetTokens] = useState<any[]>([]);
  const [spendingTokens, setSpendingTokens] = useState<any[]>([]);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const chainConfig = getChainConfig("80001");
        const provider = new ethers.providers.JsonRpcProvider(
          chainConfig?.rpcUrl
        );

        const sip = new ethers.Contract(
          chainConfig?.SIPFactory,
          SIPFactoryABI,
          provider
        );

        const response = await sip.getContractDeployedByUser(user);

        setTransactions(response);
        const targetTokensDetails = response.map(async (address: string) => {
          const contract = new ethers.Contract(address, sipABI, provider);

          const contractData = await contract.targetTokenAddress();

          return contractData;
        });
        const spendingTokensDetails = response.map(async (address: string) => {
          const contract = new ethers.Contract(address, sipABI, provider);

          const contractData = await contract.tokenAddress();

          return contractData;
        });
        const targetTokens = await Promise.all(targetTokensDetails);
        const spendingTokens = await Promise.all(spendingTokensDetails);
        console.log(spendingTokens);
        setTargetTokens(targetTokens);
        setSpendingTokens(spendingTokens);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="w-[80vw] m-auto mt-[20px]">
      <h3 className="text-3xl font-bold text-center">Your SIP Vaults</h3>
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-center">No new transactions found</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th></th>
                <th>Vaults</th>
                <th>SIP on</th>
                <th>Using</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <a
                      href={`https://mumbai.polygonscan.com/address/${transaction}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {transaction}
                    </a>
                  </td>

                  <td>{getTokenName(targetTokens[index])}</td>
                  <td>{getTokenName(spendingTokens[index])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SIPHistory;
