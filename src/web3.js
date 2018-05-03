import Web3 from 'web3';

const web3 = new Web3();

export const providers = {
  testrpc: web3.setProvider(
    new web3.providers.WebsocketProvider('ws://localhost:8545')
  )
};

// MetaMask
if (
  typeof window.web3 !== 'undefined' &&
  typeof window.web3.currentProvider !== 'undefined'
) {
  providers.window = web3.setProvider(window.web3.currentProvider);
}

export function getCurrentProvider() {
  return web3.currentProvider;
}

export function setProvider(provider) {
  if (typeof provider === 'string') {
    web3.setProvider(providers[provider]);
  } else {
    web3.setProvider(provider);
  }
}

// truffle-contract does not support web3 1.0 fully yet
// https://github.com/trufflesuite/truffle-contract/issues/57#issuecomment-331300494
export function fixTruffleContractCompatibilityIssue(contract) {
  if (typeof contract.currentProvider.sendAsync !== 'function') {
    contract.currentProvider.sendAsync = function() {
      return contract.currentProvider.send.apply(
        contract.currentProvider,
        arguments
      );
    };
  }
  return contract;
}

export default web3;
