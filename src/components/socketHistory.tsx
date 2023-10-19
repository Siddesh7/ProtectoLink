import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getChainConfig } from "../utils";
import { SocketFactoryABI } from "../constants";

interface SocketHistoryProps {
  user: string;
  approve: (tokenAddress: string, contractAddress: string) => void;
}

const SocketHistory: React.FC<SocketHistoryProps> = ({ user, approve }) => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const chainConfig = getChainConfig("80001");
        const provider = new ethers.providers.JsonRpcProvider(
          chainConfig?.rpcUrl
        );

        const socketFactory = new ethers.Contract(
          chainConfig?.SocketFactory,
          SocketFactoryABI,
          provider
        );

        const response = await socketFactory.getContractsByUser(user);
        setTransactions(response);
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
      {" "}
      <h3 className="text-3xl font-bold text-center">Your Buy Vaults</h3>
      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-center">No new transactions found</p>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th></th>
                <th>Selling Token</th>
                <th>Buying Token</th>
                <th>Amount</th>
                <th>Approve Token Spend</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{transaction[2]}</td>
                  <td>{transaction[3]}</td>
                  <td>{convertBigNumberToNumber(transaction[4])}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => {
                        approve(transaction[2], transaction[0]);
                      }}
                    >
                      Approve
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

export default SocketHistory;
