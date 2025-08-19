import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type { ResponseApi, Shop } from "~/models";

export const removeShop = async (id: number): Promise<void> => {
  await baseApi(`shop/${id}`, "DELETE");
};

export const fetchShops = async ({
  page,
  pageSize,
  search,
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<Shop>> => {
  const result = await baseApi("shop", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
  });
  return result as ResponseApi<Shop>;
};

export const createShop = async (data: Shop): Promise<Shop> => {
  const result = await baseApi("shop", "POST",
    data,
  );
  return result as Shop;
};

export const updateShop = async (data: Shop): Promise<Shop> => {
  const result = await baseApi(`shop/${data.id}`, "PATCH", data);
  return result as Shop;
};
