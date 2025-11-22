import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiEdit } from 'react-icons/fi';
import { FaMagnifyingGlass, FaTrashCan } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const { data: parcels = [], refetch } = useQuery({
    queryKey: ['my-parcels', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user.email}`);
      return res.data;
    },
  });

  const handleParcelDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/parcels/${id}`).then((res) => {
          if (res.data.deletedCount) {
            refetch();
            Swal.fire(
              'Deleted!',
              'Your parcel request has been deleted.',
              'success'
            );
          }
        });
      }
    });
  };

  const handlePayment = (parcel) => {
    // 👉 Payment page এ নেয়ার জন্য navigate
    navigate(`/dashboard/payment/${parcel._id}`);
  };

  return (
    <div>
      <h2>All of my parcels : {parcels.length}</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Cost</th>
              <th>Payment</th>
              <th>Delivery Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel, index) => (
              <tr key={parcel._id}>
                <th>{index + 1}</th>
                <td>{parcel.parcelName}</td>
                <td>{parcel.cost}</td>
                <td>
                  {parcel.paymentStatus === 'paid' ? (
                    <span className="text-green-500">Paid</span>
                  ) : (
                    <button
                      onClick={() => handlePayment(parcel)}
                      className="btn btn-sm btn-primary text-black"
                    >
                      Pay
                    </button>
                  )}
                </td>
                <td>{parcel.deliveryStatus || 'Pending'}</td>
                <td>
                  <button className="btn btn-square hover:bg-primary">
                    <FaMagnifyingGlass />
                  </button>
                  <button className="btn btn-square hover:bg-primary mx-2">
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleParcelDelete(parcel._id)}
                    className="btn btn-square hover:bg-primary"
                  >
                    <FaTrashCan />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyParcels;
