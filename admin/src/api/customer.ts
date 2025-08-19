import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type {  Customer, ResponseApi } from "~/models";

export const removeCustomer = async (id: number): Promise<void> => {
  await baseApi(`customer/${id}`, "DELETE");
};

export const fetchCustomer = async ({
  page,
  pageSize,
  search,
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<Customer>> => {
  const result = await baseApi("customer", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
  });
  return result as ResponseApi<Customer>;
};

export const updateCustomer = async (data: Customer): Promise<Customer> => {
  const result = await baseApi(`customer/${data.id}`, "PATCH", data);
  return result as Customer;
};
export const createCustomer = async (data: Customer): Promise<Customer> => {
  const result = await baseApi(`customer`, "POST", data);
  return result as Customer;
};
