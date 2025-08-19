export interface ReCheckTransactionInterface {
  responseMessage: BakongTransactionStatus;

  data: {
    amount: number;
    currency: string;
    fromAccountId: string;
    toAccountId: string;
  };
}

export interface ReCheckTransactionListInterface {
  md5: string;
  data: {
    amount: number;
    currency: string;
    fromAccountId: string;
    toAccountId: string;
  };
}

export enum BakongTransactionStatus {
  Success = 'Success',
}
