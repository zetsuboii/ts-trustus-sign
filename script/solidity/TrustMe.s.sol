// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "src/TrustMe.sol";

contract TrustMeScript is Script {
  address constant DEPLOYER = 0x81841c4648E17Db0F4Dc7e47195D19B19BA47a66;

  function run() public {
    vm.broadcast(DEPLOYER);
    new TrustMe();
  }
}
