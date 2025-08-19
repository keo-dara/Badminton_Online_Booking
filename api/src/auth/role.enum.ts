export enum Role {
  Retailer = 'retailer',
  Sale = 'sale',
  Admin = 'admin',
  Root = 'root',
}

export enum BakongStatus {
  Pending = 'pending',
  Success = 'success',
}

export enum Stocktype {
  In = 'in',
  Out = 'out',
}

export enum SaleStatus {
  Cancelled = 'cancelled',
  Draft = 'draft',
  Paid = 'paid',
  PaidSome = 'paidsome',
  Pending = 'pending',
  Expired = 'Expired',
}

export enum SalePayment {
  Cash = 'cash',
  KhQr = 'khqr',
}

export enum SubscriptionStatus {
  Active = 'active',
  Expired = 'expired',
  Cancelled = 'cancelled',
  Pending = 'pending',
}

export enum Shift {
  Morning = 'morning',
  Afternoon = 'afternoon',
}
