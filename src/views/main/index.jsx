import isEmpty from 'lodash/isEmpty';
import round from 'lodash/round';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Contract from 'truffle-contract';

import RentalService from '../../build/contracts/RentalService.json';
import { GearList, MyRentals, Transaction } from '../../components';
import { converter } from '../../config';

import * as appActions from '../../redux/app/actions';
import * as contractActions from '../../redux/contract/actions';
import * as itemsActions from '../../redux/items/actions';

import {
  fixTruffleContractCompatibilityIssue,
  getCurrentProvider
} from '../../web3';

class MainView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: undefined,
      blockNumber: undefined
    };
  }

  componentDidMount = () => {
    this.setContractInstance(RentalService);
  };

  formatGear = gear => ({
    // Name and price need to be converted
    gearId: parseInt(this.props.web3.utils.numberToHex(gear[0]), 16),
    gearName: this.props.web3.utils.hexToAscii(gear[1]),
    rentPrice: parseInt(this.props.web3.utils.numberToHex(gear[2]), 16),
    isRented: gear[3]
  });

  setContractInstance = contract => {
    let contractInstance = Contract(contract);
    contractInstance.setProvider(getCurrentProvider());
    contractInstance = fixTruffleContractCompatibilityIssue(contractInstance);

    this.props.setContract(contractInstance);

    // Get account data from this.props.web3.eth
    this.updateAccountData();
  };

  getMyRentals = () => {
    return this.props.contract
      .deployed()
      .then(deployedContract => {
        return deployedContract.getRentalIdsByUser.call();
      })
      .then(rentals => {
        return rentals.map(id => {
          return parseInt(this.props.web3.utils.numberToHex(id), 16);
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  getGearById = id => {
    return this.props.contract
      .deployed()
      .then(deployedContract => {
        return deployedContract.getGearById.call(id);
      })
      .then(gear => {
        return this.formatGear(gear);
      })
      .catch(error => {
        console.log(error);
      });
  };

  isOwner = () => {
    this.props.contract.deployed().then(deployedContract => {
      deployedContract.isOwner
        .call()
        .then(response => {
          this.props.setIsOwner(response);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  updateAccountData = () => {
    this.props.web3.eth.getCoinbase().then(account => {
      this.props.setAccount(account);

      this.props.web3.eth.getBalance(account).then(balance => {
        this.setState({
          balance: this.props.web3.utils.fromWei(balance)
        });
      });
    });

    this.props.web3.eth.getBlockNumber().then(block => {
      this.setState({ blockNumber: block });
    });
  };

  updateGearList = () => {
    this.isOwner();

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
      return this.props.contract.deployed().then(deployedContract => {
        return (
          deployedContract
            // Send transaction with fixed amount of gas
            .rentGear(gear.gearId, {
              from: this.props.account,
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
      });
    }
  };

  handleClickReturn = gear => {
    return this.props.contract.deployed().then(deployedContract => {
      return (
        deployedContract
          // Send transaction with fixed amount of gas
          .returnGear(gear.gearId, {
            from: this.props.account,
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
    });
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
            {this.props.isOwner && (
              <button onClick={() => this.props.redirect()}>Owner view</button>
            )}
          </div>
        </section>
        <section className="account">
          <div>Account: {this.props.account}</div>
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
  account: state.app.account,
  contract: state.contract,
  gearList: state.items,
  isOwner: state.app.isOwner,
  transaction: state.app.transaction,
  web3: state.web3.data
});

const mapDispatchToProps = dispatch => ({
  dismissTransaction: () => {
    dispatch(appActions.dismissTransaction());
  },
  redirect: () => {
    dispatch(push('/owner'));
  },
  rentGear: id => {
    dispatch(itemsActions.rentGear({ id }));
  },
  returnGear: id => {
    dispatch(itemsActions.returnGear({ id }));
  },
  setAccount: account => {
    dispatch(appActions.setAccount(account));
  },
  setContract: contract => {
    dispatch(contractActions.setContract(contract));
  },
  setGearList: gearList => {
    dispatch(itemsActions.setGearList(gearList));
  },
  setIsOwner: isOwner => {
    dispatch(appActions.setIsOwner(isOwner));
  },
  setRentedByMe: rentedByMe => {
    dispatch(itemsActions.setRentedByMe(rentedByMe));
  },
  setTransaction: transaction => {
    dispatch(appActions.setTransaction(transaction));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
