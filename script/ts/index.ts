import { makeTrustusSignature } from "./sign";
import { utils } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const printRemixRepr = (sign: any) => {
  console.log(`REQUEST: ${sign.request}`);
  console.log(
    `PACKET: [${sign.v},"${sign.r}","${sign.s}","${sign.request}",${sign.deadline},"${sign.payload}"]`
  );
};

// Converts ms timestamp to sec timestamp
const solidityTimestamp = Math.floor(Date.now() / 1000);

// Config
const CHAIN_ID = 3;
const TEST_DEPLOYMENT_ADDR = "0xe96d4fdaa611a2e3fe7643b3e8ca1b5bf7011f0d";

const main = async () => {
  const request = utils.formatBytes32String("GetSampleValues()");

  // Set timeout to 100 seconds
  const deadline = solidityTimestamp + 100;

  const abiCoder = new utils.AbiCoder();
  const payload = abiCoder.encode(
    ["uint256", "bytes", "uint8[]"],
    [420, utils.toUtf8Bytes("Hello"), [1, 2, 3, 4, 5, 6]]
  );

  // Calling the verify function with request and this signature should be enough
  const signature = await makeTrustusSignature(
    request,
    deadline,
    payload,
    CHAIN_ID,
    TEST_DEPLOYMENT_ADDR
  );

  // You can uncomment this line to get a representation you can use in Remix
  printRemixRepr(signature);
  console.log(signature);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(-1);
  });
