require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const crossAbi = [{"constant":false,"inputs":[{"name":"smgID","type":"bytes32"},{"name":"tokenPairID","type":"uint256"},{"name":"tokenIDs","type":"uint256[]"},{"name":"tokenValues","type":"uint256[]"},{"name":"userAccount","type":"bytes"}],"name":"userLockNFT","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"smgID","type":"bytes32"},{"name":"tokenPairID","type":"uint256"},{"name":"tokenIDs","type":"uint256[]"},{"name":"tokenValues","type":"uint256[]"},{"name":"tokenAccount","type":"address"},{"name":"userAccount","type":"bytes"}],"name":"userBurnNFT","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];
const nftAbi = [{"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","constant":true,"type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const tokenPairID = 287; // static for GMPD NFT
const scAddr = {
  97: '0xb12513cfcb13b7be59ba431c040b7206b0a211b9', //bsc-testnet
  5: '0xb8460eeaa06bc6668dad9fd42b661c0b96b3be57', //goerli 
  1: '0xfceaaaeb8d564a9d0e71ef36f027b9d162bc334e', //ethereum 
  56: '0xc3711bdbe7e3063bf6c22e7fed42f782ac82baee', //bsc
}


async function crossFromBscToEth(smgID) {
  // need to config as your cross------
  // if use metamask in frontend, you can direct connect with window.ethereum as provider, do not need rpcUrl.
  const rpcUrl = 'https://bsc-testnet.public.blastapi.io'; // cross from BSC to Goerli

  // if use metamask in frontend, you can direct connect with window.ethereum as provider, do not need PrivateKey.
  const PK = process.env.PK;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PK, provider);

  const nftContractAddr = '0x9b9492466f70e0da0f4ef0ac27a53550b0769232'; // GMPD NFT contract address
  const crossTokenIDs = ['62', '4063']; // GMPD NFT ID, replace with the ID you want to cross.
  const values = ['1', '1']; // GMPD NFT amount, static 1 for 721
  const chainId = 97;
  const toAddress = '0x4Cf0A877E906DEaD748A41aE7DA8c220E4247D9e';
  const fee = 0.11; // fee for cross, get from bridge page, static 0.11 bnb for testnet
  // ----------------------------------

  const crossSc = new ethers.Contract(scAddr[chainId], crossAbi, wallet);
  const nftSc = new ethers.Contract(nftContractAddr, nftAbi, wallet);

  console.log('approving...');
  // approve for NFT transfer
  await nftSc.setApprovalForAll(scAddr[chainId], true);
  console.log('crossing...');
  let tx = await crossSc.userLockNFT(
    smgID,
    tokenPairID,
    crossTokenIDs,
    values,
    toAddress,
    {
      value: ethers.parseUnits(fee.toString(), "ether")
    }
  )
  await tx.wait();
  console.log('cross from bsc to eth success! wait for destination chain to mint!');
}

async function crossFromEthToBsc(smgID) {
  // need to config as your cross------
  // if use metamask in frontend, you can direct connect with window.ethereum as provider, do not need rpcUrl.
  const rpcUrl = 'https://rpc.ankr.com/eth_goerli';
  // if use metamask in frontend, you can direct connect with window.ethereum as provider, do not need PrivateKey.
  const PK = process.env.PK;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PK, provider);
  const nftContractAddr = '0x3a17a676fe4f2464e84e57962956c99290b42f0d'; // GMPD NFT contract address
  const crossTokenIDs = ['5801', '5563']; // GMPD NFT ID, replace with the ID you want to cross.
  const values = ['1', '1']; // GMPD NFT amount, static 1 for 721
  const chainId = 5;
  const toAddress = '0x4Cf0A877E906DEaD748A41aE7DA8c220E4247D9e';
  // ----------------------------------

  const crossSc = new ethers.Contract(scAddr[chainId], crossAbi, wallet);
  const nftSc = new ethers.Contract(nftContractAddr, nftAbi, wallet);

  console.log('approving...');
  // approve for NFT transfer
  await nftSc.setApprovalForAll(scAddr[chainId], true);

  console.log('crossing...');
  let tx = await crossSc.userBurnNFT(
    smgID,
    tokenPairID,
    crossTokenIDs,
    values,
    nftContractAddr,
    toAddress,
  )
  await tx.wait();
  console.log('cross from bsc to eth success! wait for destination chain to release!\n\n');
}

async function main() {
  // get current smgID. (use different URL for mainnet and testnet)
  // const smgUrl = 'https://smg-api.vercel.app/api/mainnet/smgID'; // mainnet
  const smgUrl = 'https://smg-api.vercel.app/api/testnet/smgID'; // testnet

  const ret = await axios.get(smgUrl);
  const smgID = await ret.data.smgID;
  console.log('smgID', smgID);

  console.log('test cross from bsc to eth...');
  await crossFromBscToEth(smgID);

  console.log('test cross from eth to bsc...');
  await crossFromEthToBsc(smgID);

}

process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

main().then(console.log).catch(console.log);