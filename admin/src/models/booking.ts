import type { Court, SalePayment, SaleStatus } from "./product";
import type { Time } from "./shop";

export type Booking = {
  id?: number;
  customer?: string;
  no?: string;
  phone?: string;
  createdAt?: string;
  bookingDate?: string;
  bookingAt?: number;
  timeId?: number[];
  courtId?: number | null;
  bookPercent?: number | null;
  price?: number;
  discount?: number;
  total?: number;
  times?: {
    time?: Time;
    displayTime: string;
  }[];
  status?: SaleStatus;
  court?: Court;
  paymentType?: SalePayment;
};

export type QrWithBooking = {
  qr?: string;
  booking?: Booking;
  amount?: number;
};
