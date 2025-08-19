import type { Shop } from "./shop";

export type User = {
  id?: number;
  userName?: string;
  password?: string;
  recordStat?: string;
  createdDt?: string;
  updatedDt?: string;
  systemName?: string;
  role?: RoleUser;
  profilePicture?: string;
  createdBy?: User;
  balance?: number;
  twoFactorAuthenticationSecret?: string;
  paymentInfo?: KhQrInfo;
  shopId?: number;
  shop?: Shop;
};

export interface KhQrInfo {
  tag: string;
  accountID: string;
  merchantID: string;
  merchantName: string;
  merchantCity: string;
  acquiringBank: string;
}

export type Plan = {
  name: string;
  price: number;
  id: number;
  duration: number;
};

export enum RoleUser {
  Sale = "sale",
  Admin = "admin",
  Root = "root",
}

export type Subscription = {
  payment: {
    status: BakongStatus;
  };
};

export enum BakongStatus {
  Pending = "pending",
  Success = "success",
  Completed = "completed",
}

export type Credentials = {
  confirmPassword: string;
  password: string;
};
