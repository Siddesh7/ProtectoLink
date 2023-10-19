import React, { useState, ChangeEvent, FormEvent } from "react";

interface CreatePortfolioRebalancerProps {
  createPortfolioRebalancer: (
    tokenAddresses: string[],
    targetWeights: number[],
    priceFeedAddresses: string[],
    portfolioValue: number,
    interval: number
  ) => void;
}

const PortfolioRebalancer: React.FC<CreatePortfolioRebalancerProps> = ({
  createPortfolioRebalancer,
}) => {
  const assets = ["fDAIx", "DT", "ETH", "USDT"];
  const assetAddresses = [
    "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f",
    "0xefA725A5df23b6836EE9660Af6477D664BB0818B",
    "0xefA725A5df23b6836EE9660Af6477D664BB0818B",
    "0x9BCA8aC4e7ae4868A19ff7d9EC75524F0078297e",
  ];
  const chainlinkPriceFeedAddresses = [
    "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
    "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
  ];

  const [tokenAddresses, setTokenAddresses] =
    useState<string[]>(assetAddresses);
  const [targetWeights, setTargetWeights] = useState<number[]>(
    Array(assetAddresses.length).fill(0)
  );

  const [priceFeedAddresses, setPriceFeedAddresses] = useState<string[]>(
    assetAddresses.map((_, index) =>
      tokenAddresses[index] ? chainlinkPriceFeedAddresses[index] : ""
    )
  );
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [interval, setInterval] = useState<number>(0);
  const validateWeightage = () => {
    const sum = targetWeights.reduce((acc, weight, index) => {
      if (tokenAddresses[index] !== "") {
        return acc + weight;
      }
      return acc;
    }, 0);
    console.log(sum);
    return sum === 100;
  };

  const handleCheckboxChange = (index: number) => {
    const newTokenAddresses = [...tokenAddresses];
    newTokenAddresses[index] = newTokenAddresses[index]
      ? ""
      : assetAddresses[index];
    setTokenAddresses(newTokenAddresses);

    const newPriceFeedAddresses = [...priceFeedAddresses];
    newPriceFeedAddresses[index] = newTokenAddresses[index]
      ? chainlinkPriceFeedAddresses[index]
      : "";
    setPriceFeedAddresses(newPriceFeedAddresses);
  };

  const handleTargetWeightChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newTargetWeights = [...targetWeights];
    newTargetWeights[index] = Number(e.target.value);
    setTargetWeights(newTargetWeights);
  };

  const handlePortfolioValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPortfolioValue(Number(e.target.value));
  };

  const handleIntervalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInterval(Number(e.target.value));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (validateWeightage()) {
      const filteredTokenAddresses = tokenAddresses.filter(
        (_, index) => tokenAddresses[index] !== ""
      );
      const filteredTargetWeights = targetWeights.filter(
        (_, index) => tokenAddresses[index] !== ""
      );
      const filteredPricefeeds = priceFeedAddresses.filter(
        (_, index) => tokenAddresses[index] !== ""
      );

      createPortfolioRebalancer(
        filteredTokenAddresses,
        filteredTargetWeights,
        filteredPricefeeds,
        portfolioValue,
        interval * 24 * 60 * 60
      );
    } else {
      console.log("Weightage sum must be equal to 100");
    }
  };

  return (
    <div className="card w-[80vw] m-auto bg-neutral text-neutral-content p-16">
      <h2 className="text-4xl font-extrabold animate-gradient text-center mb-[10px]">
        Create an automatic Vault!
      </h2>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col  mt-[20px]">
          <p className="text-bold text-xl my-[10px]">
            Assets to include in your portfolio
          </p>
          <p className="text-bold text-xl my-[10px] ">Weightage</p>
        </div>
        <div className="flex flex-row items-center justify-center gap-4 mt-[20px]">
          {assets.map((asset, index) => (
            <div
              className="form-control w-[10vw] bg-gray-200 rounded-lg"
              key={index}
            >
              <label className="label cursor-pointer">
                <span className="label-text bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-transparent bg-clip-text font-bold ml-[4px]">
                  {asset}
                </span>
                <input
                  type="checkbox"
                  checked={tokenAddresses[index] !== ""}
                  onChange={() => handleCheckboxChange(index)}
                  className="checkbox checkbox-primary"
                />
              </label>
              <input
                type="number"
                value={targetWeights[index]}
                onChange={(e) => handleTargetWeightChange(e, index)}
                placeholder="Weightage"
                className="input input-bordered mt-[10px] text-black"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row justify-center my-[20px] gap-4 w-full">
        <div className="form-control w-[50%] bg-gray-200 rounded-lg">
          <label className="label">
            <span className="label-text bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-transparent bg-clip-text font-bold ml-[4px]">
              Portfolio Value ($)
            </span>
            <input
              type="number"
              value={portfolioValue}
              onChange={handlePortfolioValueChange}
              placeholder="Portfolio Value"
              className="input input-bordered text-black"
            />
          </label>
        </div>
        <div className="form-control w-[50%] bg-gray-200 rounded-lg">
          <label className="label">
            <span className="label-text bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-transparent bg-clip-text font-bold ml-[4px]">
              Rebalance Interval (Days)
            </span>
            <input
              type="number"
              value={interval}
              onChange={handleIntervalChange}
              placeholder="Rebalance Interval"
              className="input text-black"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-row justify-center m-4 gap-4">
        <button className="btn btn-secondary" onClick={handleSubmit}>
          Create Vault
        </button>{" "}
      </div>
    </div>
  );
};

export default PortfolioRebalancer;
