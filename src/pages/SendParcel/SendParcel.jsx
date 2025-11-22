import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

const SendParcel = () => {
  const { register, handleSubmit, control } = useForm();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const serviceCenters = useLoaderData();
  const regionsDuplicate = serviceCenters.map((c) => c.region);
  const regions = [...new Set(regionsDuplicate)];

  const senderRegion = useWatch({ control, name: 'senderRegion' });
  const receiverRegion = useWatch({ control, name: 'receiverRegion' });

  const districtsByRegion = (region) => {
    if (!region) return [];
    const regionDistricts = serviceCenters.filter((c) => c.region === region);
    return regionDistricts.map((d) => d.district);
  };

  const handleSendParcel = async (data) => {
    const isDocument = data.parcelType === 'document';
    const isSameDistrict = data.senderDistrict === data.receiverDistrict;
    const parcelWeight = parseFloat(data.parcelWeight || 0);

    let cost = 0;

    if (isDocument) {
      cost = isSameDistrict ? 60 : 80;
    } else {
      if (parcelWeight < 3) {
        cost = isSameDistrict ? 110 : 150;
      } else {
        const minCharge = isSameDistrict ? 110 : 150;
        const extraWeight = parcelWeight - 3;
        const extraCharge = isSameDistrict
          ? extraWeight * 40
          : extraWeight * 40 + 40;

        cost = minCharge + extraCharge;
      }
    }

    data.cost = cost;

    Swal.fire({
      title: 'Agree with the Cost?',
      text: `You will be charged ${cost} taka!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm and Continue to Payment!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post('/parcels', {
            ...data,
            senderEmail: data.senderEmail || user?.email,
            senderName: data.senderName || user?.displayName,
          });

          if (res.data.insertedId) {
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Parcel created. Proceed to payment.',
              showConfirmButton: false,
              timer: 2000,
            });

            navigate(`/dashboard/payment/${res.data.insertedId}`);
          }
        } catch (err) {
          console.log("PARCEL CREATE ERROR:", err);

          Swal.fire('Error', 'Failed to create parcel', 'error');
        }
      }
    });
  };

  return (
    <div>
      <h2 className="text-5xl font-bold">Send A Parcel</h2>
      <form
        onSubmit={handleSubmit(handleSendParcel)}
        className="mt-12 p-4 text-black"
      >
        {/* parcel type */}
        <div>
          <label className="label mr-4">
            <input
              type="radio"
              {...register('parcelType')}
              value="document"
              className="radio"
              defaultChecked
            />
            Document
          </label>
          <label className="label">
            <input
              type="radio"
              {...register('parcelType')}
              value="non-document"
              className="radio"
            />
            Non-Document
          </label>
        </div>

        {/* parcel info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-8">
          <fieldset className="fieldset">
            <label className="label">Parcel Name</label>
            <input
              type="text"
              {...register('parcelName')}
              className="input w-full"
              placeholder="Parcel Name"
            />
          </fieldset>

          <fieldset className="fieldset">
            <label className="label">Parcel Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              {...register('parcelWeight')}
              className="input w-full"
              placeholder="Parcel Weight"
            />
          </fieldset>
        </div>

        {/* sender + receiver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* sender */}
          <fieldset className="fieldset">
            <h4 className="text-2xl font-semibold">Sender Details</h4>

            <label className="label">Sender Name</label>
            <input
              type="text"
              {...register('senderName')}
              defaultValue={user?.displayName || ''}
              className="input w-full"
              placeholder="Sender Name"
            />

            <label className="label">Sender Email</label>
            <input
              type="email"
              {...register('senderEmail')}
              defaultValue={user?.email || ''}
              className="input w-full"
              placeholder="Sender Email"
            />

            <fieldset className="fieldset">
              <legend>Sender Regions</legend>
              <select
                {...register('senderRegion')}
                defaultValue=""
                className="select"
              >
                <option value="" disabled>
                  Pick a region
                </option>
                {regions.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Sender District</legend>
              <select
                {...register('senderDistrict')}
                defaultValue=""
                className="select"
              >
                <option value="" disabled>
                  Pick a district
                </option>
                {districtsByRegion(senderRegion).map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </fieldset>

            <label className="label mt-4">Sender Address</label>
            <input
              type="text"
              {...register('senderAddress')}
              className="input w-full"
              placeholder="Sender Address"
            />
          </fieldset>

          {/* receiver */}
          <fieldset className="fieldset">
            <h4 className="text-2xl font-semibold">Receiver Details</h4>

            <label className="label">Receiver Name</label>
            <input
              type="text"
              {...register('receiverName')}
              className="input w-full"
              placeholder="Receiver Name"
            />

            <label className="label">Receiver Email</label>
            <input
              type="email"
              {...register('receiverEmail')}
              className="input w-full"
              placeholder="Receiver Email"
            />

            <fieldset className="fieldset">
              <legend>Receiver Regions</legend>
              <select
                {...register('receiverRegion')}
                defaultValue=""
                className="select"
              >
                <option value="" disabled>
                  Pick a region
                </option>
                {regions.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Receiver District</legend>
              <select
                {...register('receiverDistrict')}
                defaultValue=""
                className="select"
              >
                <option value="" disabled>
                  Pick a district
                </option>
                {districtsByRegion(receiverRegion).map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </fieldset>

            <label className="label mt-4">Receiver Address</label>
            <input
              type="text"
              {...register('receiverAddress')}
              className="input w-full"
              placeholder="Receiver Address"
            />
          </fieldset>
        </div>

        <input
          type="submit"
          className="btn btn-primary mt-8 text-black"
          value="Send Parcel"
        />
      </form>
    </div>
  );
};

export default SendParcel;
