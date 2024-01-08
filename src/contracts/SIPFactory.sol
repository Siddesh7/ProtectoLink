// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./AutomateTaskCreator.sol";
import "./sip.sol";
import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

contract SIPFactory is AutomateTaskCreator {
    bytes32 public taskId;
    event TaskCreated(bytes32 taskId);
    address[] public deployedSIPContracts;
    using SuperTokenV1Library for ISuperToken;
    ISuperToken public tokenx;
    mapping(address => address[]) public contractsByUser;

    constructor(address _automate) AutomateTaskCreator(_automate, msg.sender) {}

    receive() external payable {}

    function getDeployedSIPContracts()
        external
        view
        returns (address[] memory)
    {
        return deployedSIPContracts;
    }

    function depositToGelatotreasury() external payable {
        _depositFunds(msg.value, ETH);
    }

    function createSIP(
        address _tokenIn,
        address _tokenOut,
        uint256 interval,
        ISuperToken _token,
        int96 flowRate
    ) external returns (address) {
        SimpleBuyerContract newContract = new SimpleBuyerContract(
            msg.sender,
            _tokenOut,
            _tokenIn
        );
        deployedSIPContracts.push(address(newContract));
        contractsByUser[msg.sender].push(address(newContract));
        tokenx = _token;

        bytes memory execData = abi.encodeCall(newContract.buyPerodically, ());
        tokenx.createFlowFrom(msg.sender, address(newContract), flowRate);
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

        return address(newContract);
    }
      function getContractDeployedByUser(
        address user
    ) external view returns (address[] memory) {
        return contractsByUser[user];
    }
}