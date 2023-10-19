import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getChainConfig } from "../utils";
import { insuranceBond, insuranceDeployerABI } from "../constants";

interface InsuranceData {
  [key: string]: any;
}
interface Props {
  user: string;
  buy: (contractAddress: string) => void;
  approve: (spender: string) => void;
}
const InsuranceDeployed: React.FC<Props> = ({ user, buy, approve }) => {
  const [transactions, setTransactions] = useState<string[]>([]);
  const [insuranceData, setInsuranceData] = useState<InsuranceData[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const chainConfig = getChainConfig("80001");
        const provider = new ethers.providers.JsonRpcProvider(
          chainConfig?.rpcUrl
        );

        const deployer = new ethers.Contract(
          chainConfig?.InsuranceDeployer,
          insuranceDeployerABI,
          provider
        );

        const response = await deployer.getCreatedInsurances();
        setTransactions(response);

        const insuranceDataPromises = response.map(async (address: string) => {
          console.log(address);
          const insuranceContract = new ethers.Contract(
            address,
            insuranceBond,
            provider
          );
          const insuranceData = await insuranceContract.getInsuranceData();

          // Convert BigNumber values to normal numbers
          const convertedData = Object.entries(insuranceData).reduce(
            (acc, [key, value]) => {
              if (ethers.BigNumber.isBigNumber(value)) {
                acc[key] = value.toNumber();
              } else {
                acc[key] = value;
              }
              return acc;
            },
            {} as InsuranceData
          );

          return convertedData;
        });

        const insuranceDataArray = await Promise.all(insuranceDataPromises);
        console.log(insuranceDataArray);
        setInsuranceData(insuranceDataArray);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="w-[80vw] m-auto mt-[50px]">
      <h3 className="text-3xl font-bold text-center mb-[10px]">
        Marketplace Insurances
      </h3>

      <table className="table table-zebra w-full">
        <thead>
          <tr></tr>
        </thead>
        <tbody>
          {transactions.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="collapse collapse-plus bg-base-200 w-full">
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title text-primary-content [input:checked~&]:bg-gray-300 [input:checked~&]:text-black rounded-xl [input:checked~&]:rounded-b-none">
                    <span className="font-bold text-20px">Address: {item}</span>
                  </div>
                  <div className="collapse-content text-primary-content [input:checked~&]:bg-gray-300 [input:checked~&]:text-black rounded-xl rounded-t-none">
                    <div>
                      <div>
                        <ul>
                          <li>
                            Amount In Bond :{" "}
                            {insuranceData[index]?.insuredAmmount}
                          </li>
                          <li>
                            Token held Address :{" "}
                            {insuranceData[index]?.assetHeld}
                          </li>
                          <li>
                            Premium Flow Rate : {insuranceData[index]?.flowRate}
                          </li>
                        </ul>
                        <ul>
                          <li>Insurer : {insuranceData[index]?.insurer}</li>
                          <li>
                            Price Threshold : {insuranceData[index]?.threshold}
                          </li>
                          {insuranceData[index]?.buyer !==
                            "0x0000000000000000000000000000000000000000" && (
                            <li>Buyer : {insuranceData[index]?.buyer}</li>
                          )}{" "}
                        </ul>
                      </div>{" "}
                      {insuranceData[index]?.buyer ==
                        "0x0000000000000000000000000000000000000000" &&
                        insuranceData[index]?.insurer != user && (
                          <button
                            className="btn my-[20px]"
                            onClick={() => {
                              approve(item);
                            }}
                          >
                            Approve
                          </button>
                        )}
                      {insuranceData[index]?.buyer ==
                        "0x0000000000000000000000000000000000000000" &&
                        insuranceData[index]?.insurer != user && (
                          <button
                            className="btn my-[20px] mx-[10px] btn-primary"
                            onClick={() => {
                              buy(item);
                            }}
                          >
                            Buy Bond
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InsuranceDeployed;
