// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract UmbraSafe {
    // =========================================== Events ============================================

    /// @notice Emitted when a payment is sent
    event Announcement(
        address indexed receiver, // stealth address
        uint256 amount, // funds
        address indexed token, // token address or ETH placeholder
        bytes32 pkx, // ephemeral public key x coordinate
        bytes32 ciphertext // encrypted entropy and payload extension
    );

    // ======================================= State variables =======================================

    /// @dev Placeholder address used to identify transfer of native ETH
    address internal constant ETH_TOKEN_PLACHOLDER = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // ======================================= Send =================================================

    /**
     * @notice Send and announce ETH payment to a stealth address
   * @param _receiver Stealth address receiving the payment
   * @param _tollCommitment Exact toll the sender is paying; should equal contract toll;
   * the committment is used to prevent frontrunning attacks by the owner;
   * see https://github.com/ScopeLift/umbra-protocol/issues/54 for more information
   * @param _pkx X-coordinate of the ephemeral public key used to encrypt the payload
   * @param _ciphertext Encrypted entropy (used to generated the stealth address) and payload extension
   */
    function sendEth(
        address payable _receiver,
        uint256 _tollCommitment,  // set to 0 for demo simplicity
        bytes32 _pkx, // ephemeral public key x coordinate
        bytes32 _ciphertext
    ) external payable {
        require(msg.value > 0, "msg.value cannot be 0");
        uint amount = msg.value;
        emit Announcement(_receiver, amount, ETH_TOKEN_PLACHOLDER, _pkx, _ciphertext);
        _receiver.send(amount);
    }

}
