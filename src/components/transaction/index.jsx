import React from 'react';

const Transaction = props => (
  <section className="transaction">
    <div className="heading">
      <span>
        Transaction{' '}
        {parseInt(props.receipt.status, 16) === 1 ? 'successful' : 'failed'}
      </span>
      <button onClick={() => props.dismissTransaction()}>Dismiss</button>
    </div>
    <div className="details">
      <div>Hash: {props.receipt.transactionHash}</div>
      <div>Block: {props.receipt.blockNumber}</div>
      <div>Gas used: {props.receipt.gasUsed} Wei</div>
    </div>
  </section>
);

export default Transaction;
