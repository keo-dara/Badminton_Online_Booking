import type { PaginationProps } from "naive-ui";
import { baseApi } from "./baseApi";
import type { ResponseApi, Time } from "~/models";

export const removeTime = async (id: number): Promise<void> => {
  await baseApi(`time/${id}`, "DELETE");
};

export const fetchTimes = async ({
  page,
  pageSize,
  search,
  order,
}: Partial<
  PaginationProps & {
    search?: string;
    order: "ASC" | "DESC";
  }
>): Promise<ResponseApi<Time>> => {
  const result = await baseApi("time", "GET", {
    page: page?.toString(),
    take: pageSize?.toString(),
    search,
    order: order,
  });
  return result as ResponseApi<Time>;
};

export const createTime = async (data: Time): Promise<Time> => {
  const result = await baseApi("time", "POST", data);
  return result as Time;
};

export const updateTime = async (data: Time): Promise<Time> => {
  const result = await baseApi(`time/${data.id}`, "PATCH", data);
  return result as Time;
};
