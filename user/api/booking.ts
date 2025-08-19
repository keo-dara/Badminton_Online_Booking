import type { Booking, BookingParams } from '~/models/booking';
import type { QRPayment } from '~/models/payment';
import { baseApi } from './baseApi';

export const booking = async (params: BookingParams): Promise<Booking> => {
  const url = `booking/guess`;

  const result = await baseApi(url, 'POST', { ...params });

  return result as Booking;
};

export const getQR = async (bookingId: string) => {
  const url = `booking/qr/${bookingId}`;

  const result = await baseApi(url, 'GET');

  return result as QRPayment;
};
