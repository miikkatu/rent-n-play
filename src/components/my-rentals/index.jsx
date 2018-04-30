import React from 'react';

const MyRentals = props => (
  <section className="gear-list">
    <div className="heading">My Rentals</div>
    <div className="gear-heading">
      <div className="name">Name</div>
      <div className="rent-price" />
      <div className="action">Action</div>
    </div>
    {props.gearList.map(
      gear =>
        gear.isRented && (
          <div className="gear" key={gear.gearId}>
            <div className="name">{gear.gearName}</div>
            <div className="rent-price" />
            {gear.isRented && (
              <div>
                <button onClick={event => props.onClickReturn(gear, event)}>
                  Return
                </button>
              </div>
            )}
          </div>
        )
    )}
  </section>
);

export default MyRentals;
