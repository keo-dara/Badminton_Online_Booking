import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type { Brand, Category, ResponseApi } from "~/models";

export const removeBrand = async (id: number): Promise<void> => {
  await baseApi(`brand/${id}`, "DELETE");
};

export const fetchBrand = async ({
  page,
  pageSize,
  search,
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<Brand>> => {
  const result = await baseApi("brand", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
  });
  return result as ResponseApi<Brand>;
};

export const updateBrand = async (data: Brand): Promise<Brand> => {
  const result = await baseApi(`brand/${data.id}`, "PATCH", data);
  return result as Brand;
};
export const createBrand = async (data: Brand): Promise<Brand> => {
  const result = await baseApi(`brand`, "POST", data);
  return result as Brand;
};
