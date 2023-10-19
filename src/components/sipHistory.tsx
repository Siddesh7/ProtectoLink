import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getChainConfig } from "../utils";
import { SIPFactoryABI } from "../constants";

interface SIPHistoryProps {
  user: string;
}

const SIPHistory: React.FC<SIPHistoryProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<any[]>([]);

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

        const response = await sip.getUserDeployedContracts(user);
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
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{transaction}</td>

                  {/* <td>
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
                  </td> */}
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
