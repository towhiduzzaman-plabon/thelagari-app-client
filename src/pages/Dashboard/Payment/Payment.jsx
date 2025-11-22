import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const Payment = () => {
  const { parcelId } = useParams();
  const axiosSecure = useAxiosSecure();

  const { isLoading, data: parcel } = useQuery({
    queryKey: ['parcel', parcelId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      return res.data;
    },
  });

  const handlePayment = async () => {
    const paymentInfo = {
      cost: parcel.cost,
      parcelId: parcel._id,
      senderEmail: parcel.senderEmail,
      parcelName: parcel.parcelName,
    };

    // ✅ নতুন API (session_id সহ)
    const res = await axiosSecure.post(
      '/payment-checkout-session',
      paymentInfo
    );

    window.location.href = res.data.url;
  };

  if (isLoading || !parcel) {
    return (
      <div>
        <span className="loading loading-infinity loading-xl"></span>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl mb-4">
        Please pay {parcel.cost} taka for: {parcel.parcelName}
      </h2>
      <button
        onClick={handlePayment}
        className="btn btn-primary text-black"
      >
        Pay
      </button>
    </div>
  );
};

export default Payment;
