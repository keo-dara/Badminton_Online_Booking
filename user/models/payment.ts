import type { Booking, Status } from './booking';

export type Payment = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  md5: string;
  data: string;
  status: Status;
  amount: number;
  currency: string;
  fromAccountId: string;
  toAccountId: string;
};

export type QRPayment = {
  qr: string;
  booking: Booking;
};
