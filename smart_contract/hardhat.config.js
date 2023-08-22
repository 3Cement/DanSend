require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/qUGgRY0dOFSDjKaJ6V09wVADx4VE2FAI',
      accounts: ['']
    }
  }
}