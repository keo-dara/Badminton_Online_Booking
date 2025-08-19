export type Shop = {
  name?: string;
  id?: number;
  phone?: string;
  address?: string;
  activeShop?: boolean;
  createdAt?: string;
  paymentString?: string;
  paymentType?: string;
  status?: string;
};

export type Time = {
  id?: number;
  from?: number | null;
  to?: number | null;
  price?: number | null;
  isVip?: boolean | null;
  shift?: Shift;
  createdAt?: string;
};

export enum Shift {
  Morning = "morning",
  Afternoon = "afternoon",
}
