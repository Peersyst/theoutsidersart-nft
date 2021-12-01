const TheOutsidersArt = artifacts.require("./TheOutsidersArt.sol");
const TheOutsidersArtFactory = artifacts.require("./TheOutsidersArtFactory.sol");
const TheOutsidersArtPreMint = artifacts.require("./TheOutsidersArtPreMint.sol");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }
  await deployer.deploy(TheOutsidersArt, proxyRegistryAddress, {gas: 30000000});
  await deployer.deploy(TheOutsidersArtFactory, proxyRegistryAddress, TheOutsidersArt.address, {gas: 30000000});
  // await deployer.deploy(TheOutsidersArtPreMint, proxyRegistryAddress, {gas: 30000000});

  const theOutsidersArt = await TheOutsidersArt.deployed();
  await theOutsidersArt.transferOwnership(TheOutsidersArtFactory.address);
};
