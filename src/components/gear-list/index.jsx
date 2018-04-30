import React from 'react';

import { converter } from '../../config';

const GearList = props => (
  <section className="gear-list">
    <div className="heading">All Gear</div>
    <div className="gear-heading">
      <div className="name">Name</div>
      <div className="rent-price">Rent price</div>
      <div className="action">Action</div>
    </div>
    {props.gearList.map(
      gear =>
        !gear.isRented && (
          <div className="gear" key={gear.gearId}>
            <div className="name">{gear.gearName}</div>
            <div className="rent-price">{gear.rentPrice / converter} ETH</div>
            {!gear.isRented && (
              <div>
                <button onClick={event => props.onClickRent(gear, event)}>
                  Rent
                </button>
              </div>
            )}
          </div>
        )
    )}
  </section>
);

export default GearList;
