import isEmpty from 'lodash/isEmpty';
import round from 'lodash/round';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Contract from 'truffle-contract';

import RentalService from '../../build/contracts/RentalService.json';
import { GearList, MyRentals, Transaction } from '../../components';
import { converter } from '../../config';
import * as actions from '../../redux/actions';

import {
  fixTruffleContractCompatibilityIssue,
  getCurrentProvider,
  default as web3
} from '../../web3';

class MainView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: undefined,
      blockNumber: undefined,
      coinbase: undefined,
      contract: undefined
    };
  }

  componentDidMount = () => {
    this.setContractInstance(RentalService);
  };

  formatGear = gear => ({
    // Name and price need to be converted
    gearId: parseInt(web3.utils.numberToHex(gear[0]), 16),
    gearName: web3.utils.hexToAscii(gear[1]),
    rentPrice: parseInt(web3.utils.numberToHex(gear[2]), 16),
    isRented: gear[3]
  });

  setContractInstance = contract => {
    let contractInstance = Contract(contract);
    contractInstance.setProvider(getCurrentProvider());
    contractInstance = fixTruffleContractCompatibilityIssue(contractInstance);

    contractInstance
      .deployed()
      .then(deployedContractInstance => {
        this.setState({
          contract: deployedContractInstance
        });

        // Get account data from web3.eth
        this.updateAccountData();
      })
      .catch(error => {
        console.log(error);
      });
  };

  getContractBalance = () => {
    this.state.contract.getContractBalance.call().then(contractBalance => {
      alert(
        `Contract balance is ${parseInt(
          web3.utils.numberToHex(contractBalance),
          16
        ) / converter} ETH`
      );
    });
  };

  withdraw = () => {
    this.state.contract
      .withdraw({
        from: this.state.coinbase,
        gas: 1000000
      })
      .then(transaction => {
        this.updateAccountData();
        this.props.setTransaction(transaction);
      });
  };

  getMyRentals = () => {
    return this.state.contract.getRentalIdsByUser
      .call()
      .then(rentals => {
        return rentals.map(id => {
          return parseInt(web3.utils.numberToHex(id), 16);
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  getGearById = id => {
    return this.state.contract.getGearById
      .call(id)
      .then(gear => {
        return this.formatGear(gear);
      })
      .catch(error => {
        console.log(error);
      });
  };

  updateAccountData = () => {
    web3.eth.getCoinbase().then(coinbase => {
      this.setState({ coinbase });

      web3.eth.getBalance(coinbase).then(balance => {
        this.setState({
          balance: web3.utils.fromWei(balance)
        });
      });
    });

    web3.eth.getBlockNumber().then(block => {
      this.setState({ blockNumber: block });
    });
  };

  updateGearList = () => {
    // Fixed list of ids
    const gearIds = [1, 2, 3];

    const gearList = gearIds.map(gearId => {
      return this.getGearById(gearId);
    });

    this.getMyRentals().then(idsRentedByMe => {
      this.props.setRentedByMe(idsRentedByMe);
    });

    Promise.all(gearList).then(gearList => {
      this.props.setGearList(gearList);
    });
  };

  handleClickRent = gear => {
    if (this.state.balance - gear.rentPrice / converter < 0) {
      alert('You do not have enough funds.');
      return;
    }

    const answer = window.confirm(
      `Rent ${gear.gearName} for ${gear.rentPrice / converter} ETH?`
    );

    if (answer) {
      return (
        this.state.contract
          // Send transaction with fixed amount of gas
          .rentGear(gear.gearId, {
            from: this.state.coinbase,
            gas: 1000000,
            value: gear.rentPrice
          })
          .then(transaction => {
            // Update redux store
            this.props.rentGear(gear.gearId);
            this.props.setTransaction(transaction);
            // Update balance and other account data
            this.updateAccountData();
          })
          // .then(
          //   rentalService
          //     .Rent({ fromBlock: this.state.blockNumber })
          //     .watch((err, res) => console.info('result: ', res))
          // )
          .catch(error => {
            console.log('Error: ', error);
          })
      );
    }
  };

  handleClickReturn = gear => {
    return (
      this.state.contract
        // Send transaction with fixed amount of gas
        .returnGear(gear.gearId, {
          from: this.state.coinbase,
          gas: 1000000
        })
        .then(transaction => {
          // Update redux store
          this.props.returnGear(gear.gearId);
          this.props.setTransaction(transaction);
          // Update balance and other account data
          this.updateAccountData();
        })
        .catch(error => {
          console.log('Error: ', error);
        })
    );
  };

  render() {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">Rent N' Play</h1>
        </header>
        <section className="actions">
          <div>
            <button onClick={() => this.updateGearList()}>
              Update from contract
            </button>
            <button onClick={() => this.getContractBalance()}>
              Contract balance (owner)
            </button>
            <button onClick={() => this.withdraw()}>Withdraw (owner)</button>
          </div>
        </section>
        <section className="account">
          <div>Account: {this.state.coinbase}</div>
          <div>Balance: {round(this.state.balance, 3)} ETH</div>
        </section>
        <GearList
          gearList={this.props.gearList}
          onClickRent={gear => this.handleClickRent(gear)}
        />
        <MyRentals
          gearList={this.props.gearList}
          onClickReturn={gear => this.handleClickReturn(gear)}
        />
        {!isEmpty(this.props.transaction) && (
          <Transaction
            dismissTransaction={() => this.props.dismissTransaction()}
            receipt={this.props.transaction.receipt}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  gearList: state.gearList,
  transaction: state.transaction
});

const mapDispatchToProps = dispatch => ({
  dismissTransaction: () => {
    dispatch(actions.dismissTransaction());
  },
  rentGear: id => {
    dispatch(actions.rentGear({ id }));
  },
  returnGear: id => {
    dispatch(actions.returnGear({ id }));
  },
  setGearList: gearList => {
    dispatch(actions.setGearList(gearList));
  },
  setRentedByMe: rentedByMe => {
    dispatch(actions.setRentedByMe(rentedByMe));
  },
  setTransaction: transaction => {
    dispatch(actions.setTransaction(transaction));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
