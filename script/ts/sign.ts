import { Wallet, utils } from "ethers";

const makeTrustusSignature = async (
  request: string,
  deadline: number,
  payload: string,
  verifyingContract: string
) => {
  const privKey = process.env?.PRIV_KEY;
  if (privKey === undefined)
    throw new Error("Private key undefined, set in on .env file");

  const wallet = new Wallet(privKey);
  const packetHash = utils.solidityKeccak256(
    ["bytes"],
    [
      abiCoder.encode(
        ["bytes32", "bytes32", "uint256", "bytes32"],
        [
          utils.solidityKeccak256(
            ["string"],
            ["VerifyPacket(bytes32 request,uint256 deadline,bytes payload)"]
          ),
          request,
          deadline,
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
          utils.solidityKeccak256(["string"], ["1.1"]),
          chainId,
          requestAddress,
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
