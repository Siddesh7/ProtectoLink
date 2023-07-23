// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./rebalancer.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    bytes checkData;
    bytes offchainConfig;
    uint96 amount;
}

interface KeeperRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

contract PortfolioRebalancerFactory  {
    struct ContractData {
        address contractAddress;
        address userAddress;
        address[] tokenAddresses;
        uint256[] targetWeights;
        address[] priceFeedAddresses;
        uint256 portfolioValue;
    }
   

    mapping(address => ContractData[]) public contractsByUser;
    LinkTokenInterface public immutable i_link;
    KeeperRegistrarInterface public immutable i_registrar;
    uint public totalVaults; 
address public owner;
     constructor(LinkTokenInterface link, KeeperRegistrarInterface registrar) {
        i_link = link;
        i_registrar = registrar;
        totalVaults=0;
        owner=msg.sender;
    }

    receive() external payable {}

    function createPortfolioRebalancer(
    address[] memory tokenAddresses,
    uint256[] memory targetWeights,
    address[] memory priceFeedAddresses,
    uint256 portfolioValue,
    uint256 interval
) external {
    PortfolioRebalancer newContract = new PortfolioRebalancer(
        msg.sender,
        tokenAddresses,
        targetWeights,
        priceFeedAddresses,
        portfolioValue,
        interval
    );
    ContractData memory contractData = ContractData({
        contractAddress: address(newContract),
        userAddress: msg.sender,
        tokenAddresses: tokenAddresses,
        targetWeights: targetWeights,
        priceFeedAddresses: priceFeedAddresses,
        portfolioValue: portfolioValue
    });

    contractsByUser[msg.sender].push(contractData);
    address payable newContractAddress = payable(address(newContract));
    newContractAddress.transfer(0.01 ether);
    RegistrationParams memory args;
    args.name = string(abi.encodePacked("vault", totalVaults));
    args.encryptedEmail = "0x00";
    args.upkeepContract = address(newContract);
    args.gasLimit = 5000000;
    args.adminAddress = owner;
    args.checkData = "0x00";
    args.offchainConfig = "0x00";
    args.amount = 1000000000000000000;

    registerAndPredictID(args);

    totalVaults++;
}

function registerAndPredictID(RegistrationParams memory params) public {
    i_link.approve(address(i_registrar), params.amount);
    uint256 upkeepID = i_registrar.registerUpkeep(params);
    if (upkeepID != 0) {
        // Use the upkeepID however you see fit
    } else {
        revert("auto-approve disabled");
    }
}


    function getContractDeployedByUser(
        address user
    ) external view returns (ContractData[] memory) {
        return contractsByUser[user];
    }
}
