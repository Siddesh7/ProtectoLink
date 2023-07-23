// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

contract socketBuyer is AutomationCompatibleInterface {
    address public owner;
    address public targetTokenAddress;
    address public tokenAddress;
    ISwapRouter public immutable swapRouter;
    uint24 public constant poolFee = 3000;
    bool status;
    uint256 public amountToBuy;

    constructor(
        address _owner,
        address _tokenOut,
        address _tokenIn,
        uint256 _amount
    ) {
        owner = _owner;
        status = true;
        tokenAddress = _tokenIn;
        targetTokenAddress = _tokenOut;
        amountToBuy = _amount * 1e18;
        swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    }

    receive() external payable {}

    function buyImmediately() public returns (uint256 amountOut) {
        // msg.sender must approve this contract
        TransferHelper.safeTransferFrom(
            tokenAddress,
            owner,
            address(this),
            amountToBuy
        );

        TransferHelper.safeApprove(
            tokenAddress,
            address(swapRouter),
            amountToBuy
        );
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenAddress,
                tokenOut: targetTokenAddress,
                fee: poolFee,
                recipient: owner,
                deadline: block.timestamp,
                amountIn: amountToBuy,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(params);
    }

    function withdraw() public returns (bool success) {
        require(msg.sender == owner, "You cannot withdraw!");

        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(owner, balance);
        }

        IERC20 targetToken = IERC20(targetTokenAddress);
        uint256 targetBalance = targetToken.balanceOf(address(this));
        if (targetBalance > 0) {
            targetToken.transfer(owner, targetBalance);
        }

        return true;
    }

  
        function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    { 
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(owner);
        upkeepNeeded = (balance >= amountToBuy);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
             IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(owner);
        if (balance >= amountToBuy) {
 
            buyImmediately();
        }
    }
}
