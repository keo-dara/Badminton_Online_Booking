import type { PaginationProps } from "naive-ui";
import type { ResponseApi } from "~/models";
import type { Order } from "~/models/product";
import { baseApi } from "./baseApi";

export const fetchOrders = async ({
  page,
  pageSize,
}: PaginationProps): Promise<ResponseApi<Order>> => {
  const result = await baseApi("orders", "GET", {
    page: page,
    take: pageSize,
  });
  return result as ResponseApi<Order>;
};

export const updateOrders = async (data: Order): Promise<Order> => {
  const result = await baseApi(`orders/${data.id}`, "PATCH", data);
  return result as Order;
};
export const verifyOrders = async (data: Order): Promise<Order> => {
  const result = await baseApi(`orders/verify/${data.id}`, "POST", data);
  return result as Order;
};
