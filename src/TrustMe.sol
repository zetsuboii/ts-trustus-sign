// SPDX-License-Identifier: APGL-3.0
pragma solidity ^0.8.4;

import {Trustus} from "./Trustus.sol";

/// @notice Simple implementation of Trustus
contract TrustMe is Trustus {
  // Errors
  //////////////////////////////////////////////////////////////////////////////
  error InvalidSignature();

  // Constructor
  //////////////////////////////////////////////////////////////////////////////
  constructor(address _trustedAddress) {
    _setIsTrusted(_trustedAddress, true);
  }

  function verify(bytes32 request, Trustus.TrustusPacket calldata packet)
    external
    returns (
      uint256 uintSample,
      bytes memory bytesSample,
      uint8[] memory arraySample
    )
  {
    if (!_verifyPacket(request, packet)) revert InvalidSignature();

    (uintSample, bytesSample, arraySample) = abi.decode(
      packet.payload,
      (uint256, bytes, uint8[])
    );
  }
}
