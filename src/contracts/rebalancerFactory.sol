// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./rebalancer.sol";
import "./AutomateTaskCreator.sol";

contract PortfolioRebalancerFactory is AutomateTaskCreator {
    struct ContractData {
        address contractAddress;
        address userAddress;
        address[] tokenAddresses;
        uint256[] targetWeights;
        address[] priceFeedAddresses;
        uint256 portfolioValue;
    }

    address public immutable owner;
    bytes32 public taskId;
    event TaskCreated(bytes32 taskId);

    mapping(address => ContractData[]) public contractsByUser;

    constructor(address _automate) AutomateTaskCreator(_automate, msg.sender) {
        owner = msg.sender;
    }

    function depositToGelatotreasury() external payable {
        _depositFunds(msg.value, ETH);
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
            portfolioValue
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
        bytes memory execData = abi.encodeWithSignature("rebalance()");

        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });
        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;

        moduleData.args[0] = _timeModuleArg(block.timestamp, interval);
        moduleData.args[1] = _proxyModuleArg();

        bytes32 id = _createTask(
            address(newContract),
            execData,
            moduleData,
            address(0)
        );

        taskId = id;
        emit TaskCreated(id);
    }

    function getContractDeployedByUser(
        address user
    ) external view returns (ContractData[] memory) {
        return contractsByUser[user];
    }
}