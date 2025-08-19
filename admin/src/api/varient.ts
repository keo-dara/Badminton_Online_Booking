import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type { Brand, Category, ResponseApi, Varient } from "~/models";

export const removeVarient = async (id: number): Promise<void> => {
  await baseApi(`varient/${id}`, "DELETE");
};

export const fetchVarients = async ({
  page,
  pageSize,
  search,
  productId,
}: Partial<
  PaginationProps & {
    search?: string;
    productId?: number;
  }
>): Promise<ResponseApi<Varient>> => {
  const result = await baseApi("varient", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
    productId: productId?.toString(),
  });
  return result as ResponseApi<Brand>;
};

export const updateVarient = async (data: Varient): Promise<Varient> => {
  const result = await baseApi(`varient/${data.id}`, "PATCH", data);
  return result as Varient;
};
export const createVarient = async (data: Varient): Promise<Varient> => {
  const result = await baseApi(`varient`, "POST", data);
  return result as Varient;
};
