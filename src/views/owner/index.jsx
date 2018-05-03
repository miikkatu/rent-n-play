import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { converter } from '../../config';

import * as appActions from '../../redux/app/actions';

class OwnerView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount = () => {
    this.checkOwnership();
  };

  checkOwnership = () => {
    if (!this.props.isOwner) {
      this.props.redirect();
    }
  };

  getContractBalance = () => {
    return this.props.contract.deployed().then(deployedContract => {
      deployedContract.getContractBalance.call().then(contractBalance => {
        alert(
          `Contract balance is ${parseInt(
            this.props.web3.utils.numberToHex(contractBalance),
            16
          ) / converter} ETH`
        );
      });
    });
  };

  withdraw = () => {
    return this.props.contract.deployed().then(deployedContract => {
      deployedContract
        .withdraw({
          from: this.props.account,
          gas: 1000000
        })
        .then(transaction => {
          // this.updateAccountData();
          this.props.setTransaction(transaction);
        });
    });
  };

  render() {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">Rent N' Play</h1>
        </header>
        <section className="actions">
          <div>Owner</div>
          <div>
            <button onClick={() => this.getContractBalance()}>
              Contract balance (owner)
            </button>
            <button onClick={() => this.withdraw()}>Withdraw (owner)</button>
            <button onClick={() => this.props.redirect()}>Main view</button>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  account: state.app.account,
  contract: state.contract,
  isOwner: state.app.isOwner,
  transaction: state.app.transaction,
  web3: state.web3.data
});

const mapDispatchToProps = dispatch => ({
  dismissTransaction: () => {
    dispatch(appActions.dismissTransaction());
  },
  redirect: () => {
    dispatch(push('/'));
  },
  setTransaction: transaction => {
    dispatch(appActions.setTransaction(transaction));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OwnerView);
