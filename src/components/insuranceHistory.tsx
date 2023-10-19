import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getChainConfig } from "../utils";
import { insuranceDeployerABI } from "../constants";

interface InsuranceHistoryProps {
  user: string;
  deposit: (address: string) => void;
  approve: (tokenAddress: string, contractAddress: string) => void;
}

const InsuranceHistory: React.FC<InsuranceHistoryProps> = ({
  user,
  deposit,
  approve,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const chainConfig = getChainConfig("80001");
        const provider = new ethers.providers.JsonRpcProvider(
          chainConfig?.rpcUrl
        );

        const insurance = new ethers.Contract(
          chainConfig?.InsuranceDeployer,
          insuranceDeployerABI,
          provider
        );

        const response = await insurance.getContractsDeployedByUser(user);
        setTransactions(response);
        console.log(response);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="w-[80vw] m-auto mt-[20px]">
      <h3 className="text-3xl font-bold text-center">Your Insurance Vaults</h3>
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-center">No new transactions found</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th></th>
                <th>Portfolio</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{transaction.contractAddress}</td>

                  <td>
                    <button
                      className="btn btn-primary ml-[10px]"
                      onClick={() => {
                        approve(
                          transaction.tokenAddress,
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

export default InsuranceHistory;
