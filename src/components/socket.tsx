import React, { useState } from "react";

const buyingTokens: string[] = ["Demo Token", "FUSDT", "fDAIx"];
const buyingTokensAddresses: string[] = [
  "0xefA725A5df23b6836EE9660Af6477D664BB0818B",
  "0x9BCA8aC4e7ae4868A19ff7d9EC75524F0078297e",
  "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f",
];
const sellingTokens: string[] = ["FDAIX", "Demo Token"];
const sellingTokensAddresses: string[] = [
  "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f",
  "0xefA725A5df23b6836EE9660Af6477D664BB0818B",
];
interface Props {
  buy: (
    buyToken: string,
    sellToken: string,
    numberOfTokens: number | null
  ) => void;
  loading: any;
}

const TokenBuyForm: React.FC<Props> = ({ buy, loading }) => {
  const [selectedBuyingToken, setSelectedBuyingToken] = useState<string>("");
  const [selectedNumberOfTokens, setSelectedNumberOfTokens] = useState<
    number | null
  >(null);
  const [selectedSellingToken, setSelectedSellingToken] = useState<string>("");
  const [selectedReceiveToken, setSelectedReceiveToken] = useState<string>("");

  const handleBuyingTokenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBuyingToken(event.target.value);
  };

  const handleNumberOfTokensChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedNumberOfTokens(parseInt(event.target.value));
  };

  const handleSellingTokenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedSellingToken(event.target.value);
  };

  const handleReceiveTokenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedReceiveToken(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    buy(selectedBuyingToken, selectedSellingToken, selectedNumberOfTokens);
    console.log(
      `I want to buy ${selectedNumberOfTokens} ${selectedBuyingToken} when I receive ${selectedSellingToken}`
    );
  };

  return (
    <div className="mt-[100px] card w-[80vw] m-auto bg-neutral text-neutral-content">
      <div className="card-body items-center text-center">
        <h2 className="text-3xl font-extrabold animate-gradient">
          Start a Token Buy Order!
        </h2>
        <div className="flex justify-center">
          <form className="flex items-center" onSubmit={handleSubmit}>
            <p className="mr-2">I want to buy</p>

            <select
              id="buyingToken"
              name="buyingToken"
              className="mr-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 text-black"
              value={selectedBuyingToken}
              onChange={handleBuyingTokenChange}
            >
              <option value="">Select a token to buy</option>
              {buyingTokens.map((token, index) => (
                <option key={index} value={buyingTokensAddresses[index]}>
                  {token}
                </option>
              ))}
            </select>

            <span className="mr-2">when I receive</span>

            <select
              id="sellingToken"
              name="sellingToken"
              className="mr-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 text-black"
              value={selectedSellingToken}
              onChange={handleSellingTokenChange}
            >
              <option value="">Select a token</option>
              {sellingTokens.map((token, index) => (
                <option key={index} value={sellingTokensAddresses[index]}>
                  {token}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="mr-2 px-3 py-1 border w-[30px] border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 text-black"
              value={
                selectedNumberOfTokens !== null
                  ? selectedNumberOfTokens.toString()
                  : ""
              }
              onChange={handleNumberOfTokensChange}
              placeholder="Number of tokens"
            />

            <select
              id="receiveToken"
              name="receiveToken"
              className="mr-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 text-black"
              value={selectedReceiveToken}
              onChange={handleReceiveTokenChange}
            >
              <option value="">Select the token to sell</option>
              {buyingTokens.map((token, index) => (
                <option key={index} value={buyingTokensAddresses[index]}>
                  {token}
                </option>
              ))}
            </select>

            {!loading ? (
              <button
                type="submit"
                className={`ml-4 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 ${
                  !selectedBuyingToken ||
                  selectedNumberOfTokens === null ||
                  !selectedSellingToken ||
                  !selectedReceiveToken
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled
              >
                Buy Tokens
              </button>
            ) : (
              <button
                type="submit"
                className={`ml-4 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 ${
                  !selectedBuyingToken ||
                  selectedNumberOfTokens === null ||
                  !selectedSellingToken ||
                  !selectedReceiveToken
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  !selectedBuyingToken ||
                  selectedNumberOfTokens === null ||
                  !selectedSellingToken ||
                  !selectedReceiveToken
                }
              >
                Buy Tokens
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TokenBuyForm;
