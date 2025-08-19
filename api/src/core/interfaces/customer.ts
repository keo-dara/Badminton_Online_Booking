export interface ICustomer {
  id: number;
  code: number;
  name: string;
  phone: string;
  email: string | null;
}

export interface ICustomerResponse {
  success: boolean;
  message: string;
  data: ICustomer;
}
