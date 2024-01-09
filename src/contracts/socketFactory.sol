// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./AutomateTaskCreator.sol";
import "./socket.sol";

contract SocketBuyerFactory is AutomateTaskCreator {
    uint256 public lastExecuted;
    bytes32 public taskId;

    event TaskCreated(bytes32 taskId);

    struct ContractDetails {
        address contractAddress;
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amount;
    }

    ContractDetails[] public deployedSocketContracts;

    mapping(address => address[]) public userDeployedContracts;

    constructor(address _automate) AutomateTaskCreator(_automate, msg.sender) {}

    receive() external payable {}

    function getContractsByUser(
        address _user
    ) external view returns (ContractDetails[] memory) {
        address[] storage userContracts = userDeployedContracts[_user];
        ContractDetails[] memory contractsByUser = new ContractDetails[](
            userContracts.length
        );

        for (uint256 i = 0; i < userContracts.length; i++) {
            address contractAddress = userContracts[i];
            for (uint256 j = 0; j < deployedSocketContracts.length; j++) {
                if (
                    deployedSocketContracts[j].contractAddress ==
                    contractAddress
                ) {
                    contractsByUser[i] = deployedSocketContracts[j];
                    break;
                }
            }
        }

        return contractsByUser;
    }

    function depositToGelatotreasury() external payable {
        _depositFunds(msg.value, ETH);
    }

    function createTask(
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) external {
        socketBuyer newContract = new socketBuyer(
            msg.sender,
            _tokenOut,
            _tokenIn,
            _amount
        );
        deployedSocketContracts.push(
            ContractDetails({
                contractAddress: address(newContract),
                user: msg.sender,
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                amount: _amount
            })
        );
        userDeployedContracts[msg.sender].push(address(newContract));

        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.RESOLVER;
        moduleData.modules[1] = Module.PROXY;

        moduleData.args[0] = _resolverModuleArg(
            address(newContract),
            abi.encodeCall(newContract.checker, ())
        );
        moduleData.args[1] = _proxyModuleArg();

        bytes32 id = _createTask(
            address(newContract),
            abi.encode(newContract.buyImmediately.selector),
            moduleData,
            address(0)
        );

        taskId = id;
        emit TaskCreated(id);
    }
}