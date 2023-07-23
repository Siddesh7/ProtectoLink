// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./socket.sol";
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
contract SocketBuyerFactory   {
    uint256 public lastExecuted;
  

    struct ContractDetails {
        address contractAddress;
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amount;
    }

    ContractDetails[] public deployedSocketContracts;

    mapping(address => address[]) public userDeployedContracts;

    LinkTokenInterface public immutable i_link;
    KeeperRegistrarInterface public immutable i_registrar;
    uint256 public totalBonds; 
    address public owner;
    constructor(LinkTokenInterface link, KeeperRegistrarInterface registrar) {
        i_link = link;
        i_registrar = registrar;
        totalBonds=0;
        owner=msg.sender;
    }



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
        RegistrationParams memory args;
              address payable newContractAddress = payable(address(newContract));
        newContractAddress.transfer(0.01 ether);
        totalBonds++;
         // Increment the total number of SIPs
        args.name = string(abi.encodePacked("socket", totalBonds));  // Set args.name to "bond" followed by the totalSIPs value
        args.encryptedEmail = "0x00";
        args.upkeepContract = address(newContract);
        args.gasLimit = 5000000;
        args.adminAddress = owner;
        args.checkData = "0x00";
        args.offchainConfig = "0x00";
        args.amount = 1000000000000000000;

        registerAndPredictID(args);

     
    }

    function registerAndPredictID(RegistrationParams memory params) public {
        // LINK must be approved for transfer - this can be done every time or once
        // with an infinite approval
        
        i_link.approve(address(i_registrar), params.amount);
        uint256 upkeepID = i_registrar.registerUpkeep(params);
        if (upkeepID != 0) {
            // DEV - Use the upkeepID however you see fit
        } else {
            revert("auto-approve disabled");
        }
    }
}
