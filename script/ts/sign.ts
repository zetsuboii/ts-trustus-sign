import { Wallet, utils } from "ethers";

/**
 * @description Prepares a EIP-712 compilant signature
 * @param request: bytes32 request string,
 * @param deadline: UNIX second timestamp after which the sign. is invalid
 * @param payload: bytes payload to send, preferably abi encoded
 * @param verifyingContract: Address of the requesting contract
 */
const makeTrustusSignature = async (
  request: string,
  deadline: number,
  payload: string,
  chainId: number,
  verifyingContract: string
) => {
  const privKey = process.env?.PRIV_KEY;
  if (privKey === undefined)
    throw new Error("Private key undefined, set in on .env file");

  const wallet = new Wallet(privKey);
  
  // This part is heavily inspired by @dxganta's work. I know that ethers also
  // has the `wallet._signTypedData` method but it didn't work out the same way
  const abiCoder = new utils.AbiCoder();

  // Both in the packet and the domain selector, signature and arguments are
  // packed and then hashed using keccak256. `bytes` and `string` types are
  // hashed before packing and other types are left as is. 
  const packetHash = utils.solidityKeccak256(
    ["bytes"],
    [
      abiCoder.encode(
        ["bytes32", "bytes32", "uint256", "bytes32"],
        [
          utils.solidityKeccak256(
            ["string"],
            ["VerifyPacket(bytes32 request,uint256 deadline,bytes32 payload)"]
          ),
          request,
          deadline,

          // In EIP712 standard dynamic types, namely string and bytes, are
          // hashed using keccak256. This is pointed out by this issue:
          // https://github.com/ZeframLou/trustus/issues/3
          utils.solidityKeccak256(["bytes"], [payload]),
        ]
      ),
    ]
  );

  const domainSeparator = utils.solidityKeccak256(
    ["bytes"],
    [
      abiCoder.encode(
        ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        [
          utils.solidityKeccak256(
            ["string"],
            [
              "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)",
            ]
          ),
          utils.solidityKeccak256(["string"], ["Trustus"]),

          // Since the contract I use will hash the payload, I thought it might 
          // make sense the version it differently. If you want to use the 
          // original contract, change this to 1 and change the part I hash the
          // payload and replace it with plain `payload`.
          utils.solidityKeccak256(["string"], ["1.1"]),
          chainId,
          verifyingContract,
        ]
      ),
    ]
  );

  const messageHashOffChain = utils.solidityKeccak256(
    ["bytes"],
    [
      utils.solidityPack(
        ["string", "bytes", "bytes32"],
        ["\x19\x01", domainSeparator, packetHash]
      ),
    ]
  );

  // Create a signing key from from the private key and sign the digest
  const signingKey = new utils.SigningKey(wallet.privateKey);
  const { v, r, s } = signingKey.signDigest(messageHashOffChain);
  return { v, r, s, request, deadline, payload };
};

export { makeTrustusSignature }