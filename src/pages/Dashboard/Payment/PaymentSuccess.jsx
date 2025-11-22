import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({});
  const sessionId = searchParams.get('session_id');
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (sessionId) {
      axiosSecure
        .patch(`/payment-success?session_id=${sessionId}`)
        .then((res) => {
          setPaymentInfo({
            transactionId: res.data.transactionId,
            trackingId: res.data.trackingId,
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [sessionId, axiosSecure]);

  return (
    <div>
      <h2 className="text-4xl mb-4">Payment successful</h2>
      <p>Your Transaction ID: {paymentInfo.transactionId}</p>
      <p>Your Parcel Tracking ID: {paymentInfo.trackingId}</p>

      <Link
        to="/dashboard/my-parcels"
        className="btn btn-primary text-black mt-4"
      >
        Go to My Parcels
      </Link>
    </div>
  );
};

export default PaymentSuccess;
