import type { Availability } from './availability';
import type { Court } from './court';
import type { Payment } from './payment';

export type Booking = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  status: Status;
  paymentType: PaymentType;
  no: string;
  customer: string;
  phone: string;
  price: number;
  bookingDate: string;
  courtName: string;
  times: Availability[];
  court: Court;
  payment: Payment;
  hashString?: string;
  url?: string;
  time?: number;
  merchantId?: string;
};

export type BookingParams = {
  customer: string;
  phone: string;
  bookingAt: number;
  courtId: number;
  timeId: number[];
  bookPercent: number;
};

export enum Status {
  Cancelled = 'cancelled',
  Draft = 'draft',
  Paid = 'paid',
  Pending = 'pending',
  Expired = 'Expired'
}

export enum PaymentType {
  Cash = 'cash',
  KhQr = 'khqr'
}
