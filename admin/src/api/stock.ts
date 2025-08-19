import type { PaginationProps } from "naive-ui";
import type { ResponseApi, Stock } from "~/models";
import { baseApi } from "./baseApi";

export const fetchStocks = async ({
  page,
  pageSize,
  varientId,
}: Partial<
  PaginationProps & {
    varientId?: number;
  }
>): Promise<ResponseApi<Stock>> => {
  const result = await baseApi("stock", "GET", {
    page: page,
    take: pageSize,
    varientId,
  });
  return result as ResponseApi<Stock>;
};

export const createStock = async (data: Stock): Promise<Stock> => {
  const result = await baseApi("stock", "POST", data);
  return result as Stock;
};
