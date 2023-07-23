pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import "./insuranceBond.sol";
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

contract InsuranceDeployer {
    uint public totalInsuranceBonds;
    address public owner;
    string public insuranceName;
    uint public insuredAmt;
    uint256 public allowAsset;

    LinkTokenInterface public immutable i_link;
    KeeperRegistrarInterface public immutable i_registrar;
   address[] public InsurancesRegistered;
    struct ContractData {
        address contractAddress;
        address userAddress;
        int thresh;
        ISuperToken token;
        address assetInsured;
        uint256 insuredAmt;
        address tokenAddress;
        int96 flowRate;
    }

    mapping(address => ContractData[]) public contractsByUser;

    constructor(LinkTokenInterface link, KeeperRegistrarInterface registrar) {
        i_link = link;
        i_registrar = registrar;
        totalInsuranceBonds = 0;
        owner = msg.sender;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function createInsurance(
        int _thresh,
        ISuperToken _token,
        address assetInsured,
        uint256 _insuredAmt,
        address _tokenAddress,
        int96 _flowRate
    ) public {
        address insurance = address(
            new InsuranceBond(
                _thresh,
                _token,
                assetInsured,
                _insuredAmt,
                _tokenAddress,
                _flowRate,
                msg.sender
            )
        );

        ContractData memory contractData = ContractData({
            contractAddress: insurance,
            userAddress: msg.sender,
            thresh: _thresh,
            token: _token,
            assetInsured: assetInsured,
            insuredAmt: _insuredAmt,
            tokenAddress: _tokenAddress,
            flowRate: _flowRate
        });

        address payable insurancePayable = payable(insurance);
        insurancePayable.transfer(0.01 ether);

        contractsByUser[msg.sender].push(contractData);
 InsurancesRegistered.push(insurance);
        RegistrationParams memory args;
        args.name = string(abi.encodePacked("vault", totalInsuranceBonds));
        args.encryptedEmail = "0x00";
        args.upkeepContract = insurance;
        args.gasLimit = 5000000;
        args.adminAddress = owner;
        args.checkData = "0x00";
        args.offchainConfig = "0x00";
        args.amount = 1000000000000000000;

        registerAndPredictID(args);

        totalInsuranceBonds++;
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
 function getCreatedInsurances() public view returns (address[] memory) {
        return InsurancesRegistered;
    }
    function getContractsDeployedByUser(address user) external view returns (ContractData[] memory) {
        return contractsByUser[user];
    }
}
