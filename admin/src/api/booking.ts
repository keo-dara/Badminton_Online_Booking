import type { PaginationProps } from 'naive-ui';
import type { Booking, ResponseApi, Sale, SaleStatus } from '~/models';
import { baseApi } from './baseApi';

export const fetchBookings = async ({
  page,
  pageSize,
  search,
  status,
  startDate,
  endDate,
  date
}: Partial<
  PaginationProps & {
    search?: string;
    status?: SaleStatus;
    startDate?: number;
    endDate?: number;
    date?: string;
  }
>): Promise<ResponseApi<Booking>> => {
  let qs: any = {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
    order: 'DESC',
    status,
    date
  };

  if (startDate && endDate) {
    qs = {
      ...qs,
      startDate,
      endDate
    };
  }

  const result = await baseApi('booking', 'GET', qs);
  return result as ResponseApi<Booking>;
};

export const createBooking = async (booking: Booking): Promise<Booking> => {
  const result = await baseApi('booking', 'POST', booking);
  return result as Booking;
};
export const updateBooking = async (booking: Booking, pushNotification: boolean = true): Promise<Booking> => {
  const result = await baseApi(`booking/${booking.id}`, 'PATCH', {
    ...booking,
    pushNotification
  });
  return result as Booking;
};

export const removeBooking = async (id: number): Promise<void> => {
  await baseApi(`booking/${id}`, 'DELETE');
};

export const getImageQrBooking = async (
  id: number
): Promise<{
  qr: string;
  booking: Booking;
  amount: number;
}> => {
  const result = await baseApi(`booking/qr/${id}`, 'GET');

  return result as {
    qr: string;
    booking: Booking;
    amount: number;
  };
};
