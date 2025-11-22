import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancelled = () => {
  return (
    <div>
      <h2 className="text-2xl mb-4">
        Payment is cancelled. Please try again.
      </h2>
      {/* Link নিজেই <a>, তাই button wrap না করে className দিচ্ছি */}
      <Link
        to="/dashboard/my-parcels"
        className="btn btn-primary text-black"
      >
        Back to My Parcels
      </Link>
    </div>
  );
};

export default PaymentCancelled;
