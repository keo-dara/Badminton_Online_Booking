import type { ResponseApi, Sale, SaleItem, SaleStatus } from "~/models";
import { baseApi } from "./baseApi";
import type { PaginationProps } from "naive-ui";

export const createSale = async (sale: Sale): Promise<Sale> => {
  const result = await baseApi("sale", "POST", sale);
  return result as Sale;
};

export const getImageQr = async (
  id: number
): Promise<{
  qr: string;
  sale: Sale;
}> => {
  const result = await baseApi(`sale/qr/${id}`, "GET");

  return result as {
    qr: string;
    sale: Sale;
  };
};

export const removeSale = async (id: number): Promise<void> => {
  await baseApi(`sale/${id}`, "DELETE");
};

export const updateSale = async (sale: Sale): Promise<Sale> => {
  const result = await baseApi(`sale/${sale.id}`, "PATCH", sale);
  return result as Sale;
};

export const fetchSales = async ({
  page,
  pageSize,
  search,
  status,
  startDate,
  endDate,
  ignoreDraft = true
}: Partial<
  PaginationProps & {
    search?: string;
    status?: SaleStatus;
    startDate?: number;
    endDate?: number;
    ignoreDraft?: boolean;
  }
>): Promise<ResponseApi<Sale>> => {
  let qs: any = {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
    order: "DESC",
    status,
    ignoreDraft,
  };

  if (startDate && endDate) {
    qs = {
      ...qs,
      startDate,
      endDate,
    };
  }

  const result = await baseApi("sale", "GET", qs);
  return result as ResponseApi<Sale>;
};
