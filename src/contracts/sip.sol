// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SimpleBuyerContract {
    address public owner;
    address public targetTokenAddress;
    address public tokenAddress;
    ISwapRouter public immutable swapRouter;
    uint24 public constant poolFee = 3000;
    bool status;

    constructor(address _owner, address _tokenOut, address _tokenIn) {
        owner = _owner;
        status = true;
        tokenAddress = _tokenIn;
        targetTokenAddress = _tokenOut;

        swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    }

    receive() external payable {}

    function buyPerodically() external returns (uint256 amountOut) {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "Low Balance");

        TransferHelper.safeApprove(tokenAddress, address(swapRouter), balance);
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenAddress,
                tokenOut: targetTokenAddress,
                fee: poolFee,
                recipient: owner,
                deadline: block.timestamp,
                amountIn: balance,
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
}