import type { Booking } from "./booking";
import type { Time } from "./shop";

export type Product = {
  id?: number;
  name?: string;
  code?: string;
  img?: string;
  description?: string;
  price?: number | null;
  discountPrice?: number;
  catalogId?: number;
  brandId?: number;
  enabled?: boolean;
  catalog?: Category;
  brand?: Brand;
};
export type ReqProduct = {
  id?: number;
  name?: string;
  code?: string;
  img?: string;
  description?: string;
  enabled?: boolean;
  shopId?: number;
  catalogId?: number;
  brandId?: number;
};

export type Category = {
  id?: number;
  name?: string;
};

export type Brand = {
  id?: number;
  name?: string;
};
export type Court = {
  id?: number | null;
  name?: string;
  description?: string;
  timeId?: number[] | null;
  times?: Time[];
  enable?: boolean | null;
  discount?: number;
};

export type SaleItem = {
  id?: number;
  productId?: number;
  name?: string;
  note?: string;
  qty?: number;
  price?: number | null;
};

export type Sale = {
  id?: number;
  no?: string;
  customerId?: number | null | undefined;
  status?: SaleStatus;
  paymentType?: SalePayment;
  discount?: number;
  items?: SaleItem[];
  total?: number;
  tax?: number;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
};

export type QrWithSale = {
  qr?: string;
  sale?: Sale;
  booking?: Booking;
};

export enum SaleStatus {
  Cancelled = "cancelled",
  Draft = "draft",
  Paid = "paid",
  Pending = "pending",
  Expired = "Expired",
  PaidSome = 'paidsome',
}

export enum SalePayment {
  Cash = "cash",
  KhQr = "khqr",
}

export type Customer = {
  id?: number | null;
  name?: string;
  phone?: string;
};


export type Availability = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isBusy: boolean;
  isBooked: boolean;
  isDisable: boolean;
  bookingDate: Date;
  time: Time;
  displayTime: string;
};
