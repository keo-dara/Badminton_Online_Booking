import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type { ResponseApi } from "~/models";
import type { Category, Product, ReqProduct } from "~/models/product";

export const fetchProducts = async ({
  page,
  pageSize,
  search,
  shopId,
  catagoryId,
  brandId,
}: Partial<
  PaginationProps & {
    search?: string;
    shopId: number;
    catagoryId?: number;
    brandId?: number;
  }
>): Promise<ResponseApi<Product>> => {
  const result = await baseApi("product", "GET", {
    page: page,
    take: pageSize,
    shopId: shopId,
    search,
    catagoryId,
    brandId,
  });
  return result as ResponseApi<Product>;
};

export const updateProduct = async (data: ReqProduct): Promise<Product> => {
  const result = await baseApi(`product/${data.id}`, "PATCH", data);
  return result as Product;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const result = await baseApi("product" + id, "GET");
  return result as Product;
};

export const removeProduct = async (id: number): Promise<void> => {
  await baseApi(`product/${id}`, "DELETE");
};

export const removeCategories = async (id: number): Promise<void> => {
  await baseApi(`catalog/${id}`, "DELETE");
};
export const fetchCategories = async ({
  page,
  pageSize,
  search,
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<Category>> => {
  const result = await baseApi("catalog", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
  });
  return result as ResponseApi<Category>;
};

export const createProduct = async (product: ReqProduct): Promise<Product> => {
  const result = await baseApi("product", "POST", product);
  return result as Product;
};

export const createCategories = async (name: string): Promise<Category> => {
  const result = await baseApi("catalog", "POST", {
    name,
  });
  return result as Category;
};

export const updateCategories = async (data: Category): Promise<Category> => {
  const result = await baseApi(`catalog/${data.id}`, "PATCH", data);
  return result as Category;
};
