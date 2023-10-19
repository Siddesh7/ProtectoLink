import { useEffect, useState, ChangeEvent } from "react";
import { calculateFlowRate } from "../utils/createFlow";
interface InsuranceData {
  assetInsured: string;
  assetDeposited: string;
  depositAmount: string;
  premiumAsset: string;
  monthlyPremium: string;
  thresholdPrice: string;
}
interface Props {
  createInsurance: (
    threshold: string,
    superToken: string,
    assetInsured: String,
    insuranceAmt: String,
    tokenAddress: string,
    flowRate: string
  ) => void;
}
export default function CreateBond({ createInsurance }: Props) {
  const [insurance, setInsurance] = useState<InsuranceData>({
    assetInsured: "",
    assetDeposited: "",
    depositAmount: "",
    premiumAsset: "",
    monthlyPremium: "",
    thresholdPrice: "",
  });

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name == "depositAmount") {
      const amount: number = parseInt(value) * 1e18;
      setInsurance((prevData) => ({
        ...prevData,
        [name]: amount.toString(),
      }));
    } else if (name !== "monthlyPremium") {
      setInsurance((prevData) => ({
        ...prevData,
        [name]: value.toString(),
      }));
    } else {
      const monthlyAmount = parseInt(value) || 0;
      const calculatedFlowRate = calculateFlowRate(monthlyAmount);
      setInsurance((prevData) => ({
        ...prevData,
        [name]: calculatedFlowRate!.toString(),
      }));
    }
  };

  const createBond = () => {
    console.log(insurance);
    createInsurance(
      insurance.thresholdPrice,
      insurance.premiumAsset,
      insurance.assetInsured,
      insurance.depositAmount,
      insurance.assetDeposited,
      insurance.monthlyPremium
    );
  };

  return (
    <div className="my-[60px] min-h-[30vh] card w-[80vw] m-auto bg-neutral  text-black">
      <div className="card-body items-center text-center">
        <h2 className="text-4xl font-extrabold animate-gradient">
          Protect your assets with easy Insurance!
        </h2>
        <p className="text-gray-400 text-base pb-[20px]">
          create an insurance, pay in money streams, get settlements
          immediately!
        </p>

        <label
          htmlFor="my-modal-3"
          className="btn-secondary text-white py-2 px-4 rounded absolute my-[100px]"
        >
          Create
        </label>

        <input type="checkbox" id="my-modal-3" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box relative">
            <label
              htmlFor="my-modal-3"
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="text-lg font-bold">
              Please provide the details for your insurance bond creation
            </h3>
            <div className="flex flex-col gap-4 mt-[10px]">
              <select
                className="select select-primary w-full"
                onChange={handleInputChange}
                name="assetInsured"
              >
                <option disabled selected>
                  What asset are you creating the insurance for?
                </option>
                <option value="0x007A22900a3B98143368Bd5906f8E17e9867581b">
                  Bitcoin
                </option>
                <option value="0x0715A7794a1dc8e42615F059dD6e406A6594651A">
                  Ethereum
                </option>
                <option value="0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada">
                  Matic
                </option>
                <option value="0xEB0fb293f368cE65595BeD03af3D3f27B7f0BD36">
                  Solana
                </option>
              </select>
              <select
                className="select select-primary w-full"
                onChange={handleInputChange}
                name="assetDeposited"
                required
              >
                <option disabled selected>
                  Which asset are you depositing into the bond?
                </option>
                <option value="0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f">
                  DAI
                </option>
                <option value="0x9BCA8aC4e7ae4868A19ff7d9EC75524F0078297e">
                  fUSDT
                </option>
              </select>
              <input
                type="number"
                placeholder="How much are you depositing?"
                className="input input-bordered input-info w-full"
                onChange={handleInputChange}
                name="depositAmount"
              />
              <select
                className="select select-primary w-full"
                onChange={handleInputChange}
                name="premiumAsset"
              >
                <option disabled selected>
                  Which asset will you accept for premium payments?
                </option>
                <option value="0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f">
                  fDAIx
                </option>
                <option
                  value="0x918E0d5C96cAC79674E2D38066651212be3C9C48"
                  disabled
                >
                  fTUSDx
                </option>
                <option
                  value="0x42bb40bF79730451B11f6De1CbA222F17b87Afd7"
                  disabled
                >
                  fUSDCx
                </option>
              </select>
              <input
                type="number"
                placeholder="How much is the monthly premium? 100/mo"
                className="input input-bordered input-info w-full"
                onChange={handleInputChange}
                name="monthlyPremium"
              />
              <input
                type="number"
                placeholder="Threshold price? Triggers payment to buyer(insured amount)"
                className="input input-bordered input-info w-full"
                required
                onChange={handleInputChange}
                name="thresholdPrice"
              />

              <button className="btn btn-success" onClick={createBond}>
                Create bond
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
