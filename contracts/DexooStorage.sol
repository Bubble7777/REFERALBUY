// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.6.12;

import "./utils/Ownable.sol";
import './libraries/TransferHelper.sol';
import "hardhat/console.sol";



contract DexooStorage is Ownable{

    event WithdrawRewards(address user, uint256 amount);

    mapping(address=>uint256) balances;
  
    function getReferralRewards(address user) external view returns(uint){
        return balances[user];
    }

    function addReferralReward(address user) external payable returns (bool){
        require(user != address(0), "DexooStorage: ZERO_USER_ADDRESS");
        uint256 amount = msg.value / 2;
        balances[user] += amount;
        balances[owner()] += amount;
        return true;
    }

    function addSystemComission() external payable returns(bool) {
        balances[owner()] += msg.value;
        return true;
    }


    function withdraw() external onlyOwner {
        require(balances[owner()] != 0, "DexooStorage: BALANCE IS NULL");
        uint256 amount = balances[owner()];
        balances[owner()] -= amount; 
        TransferHelper.safeTransferETH(owner(), amount);
        emit WithdrawRewards(owner(), amount);
    }



    function withdrawReferralReward(uint256 amount) external {
        address user = msg.sender;
        require(balances[user] >= amount, "DexooStorage: INSUFFICIENT_FUNDS");
        require(balances[user] != 0, "DexooStorage: USER_BALANCE_IS_NULL");
        balances[user] -= amount;
        TransferHelper.safeTransferETH(user, amount);
        emit WithdrawRewards(user, amount);
    }
        



}
