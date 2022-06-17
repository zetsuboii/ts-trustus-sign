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
}