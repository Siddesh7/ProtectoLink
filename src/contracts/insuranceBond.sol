// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InsuranceBond is AutomationCompatibleInterface {
    AggregatorV3Interface internal priceFeed;
    using SuperTokenV1Library for ISuperToken;
    ISuperToken public token;
    bool public hasPurchased = false;
    int public priceOfInsuredAsset;
    int public threshold;
    bool public status;
    address public insurer;
    address public buyer;
    uint public insuredAmmount;
    IERC20 public assetHeld;
    int96 public flowRate;
    address public assetHeldAddress;
    struct insuranceData {
        address insurer;
        address buyer;
        uint insuredAmmount;
        address assetHeld;
        int96 flowRate;
        int threshold;
    }

    insuranceData public myInsuranceData;

    constructor(
        int _threshold,
        ISuperToken _token,
        address assetInsured,
        uint _insuredAmt,
        address _tokenAddress,
        int96 _flowRate,
        address _insurer
    ) {
        priceFeed = AggregatorV3Interface(assetInsured);
        threshold = _threshold;
        token = _token;
        flowRate = _flowRate;
        assetHeld = IERC20(_tokenAddress);
        assetHeldAddress = _tokenAddress;
        insuredAmmount = _insuredAmt;
        insurer = _insurer;

        myInsuranceData = insuranceData(
            insurer,
            buyer,
            insuredAmmount,
            assetHeldAddress,
            flowRate,
            threshold
        );
    }

    function getInsuranceData() public view returns (insuranceData memory) {
        return myInsuranceData;
    }

    function depositInsuredAmount() public payable {
        address sender = msg.sender;
        insurer = sender;
        address recipient = address(this);
        bool success = assetHeld.transferFrom(
            sender,
            recipient,
            insuredAmmount
        );
        require(success, "Transfer failed");
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function getLatestPrice() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function buyInsurance() public {
        require(!hasPurchased, "Insurance has already been purchased");
        buyer = msg.sender;
        token.createFlowFrom(msg.sender, insurer, flowRate);
        hasPurchased = true;
        myInsuranceData = insuranceData(
            insurer,
            buyer,
            insuredAmmount,
            assetHeldAddress,
            flowRate,
            threshold
        );
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        priceOfInsuredAsset = getLatestPrice();

        if (priceOfInsuredAsset < threshold && status == false) {
            upkeepNeeded = true;
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        status = true;
        assetHeld.transfer(buyer, assetHeld.balanceOf(address(this)));
        token.deleteFlowFrom(buyer, insurer);
    }
}
