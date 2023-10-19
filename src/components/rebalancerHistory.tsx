import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getChainConfig } from "../utils";
import { RebalancerFactoryABI } from "../constants";

interface RebalanceHistoryProps {
  user: string;
  approve: (tokenAddress: string[], contractAddress: string) => void;
  deposit: (contractAddress: string) => void;
  withdraw: (contractAddress: string) => void;
}

const RebalanceHistory: React.FC<RebalanceHistoryProps> = ({
  user,
  approve,
  deposit,
  withdraw,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const chainConfig = getChainConfig("80001");
        const provider = new ethers.providers.JsonRpcProvider(
          chainConfig?.rpcUrl
        );

        const rebalancer = new ethers.Contract(
          chainConfig?.RebalancerFactory,
          RebalancerFactoryABI,
          provider
        );

        const response = await rebalancer.getContractDeployedByUser(user);
        setTransactions(response);
        console.log(response);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  const convertBigNumberToNumber = (value: ethers.BigNumber) => {
    return value.toNumber();
  };

  return (
    <div className="w-[80vw] m-auto mt-[20px]">
      <h3 className="text-3xl font-bold text-center">Your Vaults</h3>
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-center">No new transactions found</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th></th>
                <th>Portfolio</th>

                <th>Approve Token Spend</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{transaction.contractAddress}</td>

                  <td>
                    <button
                      className="btn"
                      onClick={() => {
                        approve(
                          transaction.tokenAddresses,
                          transaction.contractAddress
                        );
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-primary ml-[10px]"
                      onClick={() => {
                        deposit(transaction.contractAddress);
                      }}
                    >
                      Deposit
                    </button>
                    <button
                      className="btn btn-accent ml-[10px]"
                      onClick={() => {
                        withdraw(transaction.contractAddress);
                      }}
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RebalanceHistory;
