// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "./sip.sol";

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
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
contract SIPFactory  {
    address[] public deployedSIPContracts;
    using SuperTokenV1Library for ISuperToken;
    ISuperToken public tokenx;
    LinkTokenInterface public immutable i_link;
    KeeperRegistrarInterface public immutable i_registrar;
    uint256 public totalSIPs; 
    address public owner;
    constructor(LinkTokenInterface link, KeeperRegistrarInterface registrar) {
        i_link = link;
        i_registrar = registrar;
        totalSIPs=0;
        owner=msg.sender;
    }


    receive() external payable {}

    function getDeployedSIPContracts()
        external
        view
        returns (address[] memory)
    {
        return deployedSIPContracts;
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
            _tokenIn,
            interval
        );
        deployedSIPContracts.push(address(newContract));
        address payable newContractAddress = payable(address(newContract));
        newContractAddress.transfer(0.01 ether);
        tokenx = _token;
        totalSIPs++; 
        tokenx.createFlowFrom(msg.sender, address(newContract), flowRate);

        RegistrationParams memory args;

         // Increment the total number of SIPs
        args.name = string(abi.encodePacked("bond", totalSIPs));  // Set args.name to "bond" followed by the totalSIPs value
        args.encryptedEmail = "0x00";
        args.upkeepContract = address(newContract);
        args.gasLimit = 500000;
        args.adminAddress = owner;
        args.checkData = "0x00";
        args.offchainConfig = "0x00";
        args.amount = 1000000000000000000;

        registerAndPredictID(args);

        return address(newContract);
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
