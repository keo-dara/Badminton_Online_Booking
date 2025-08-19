import type { PaginationProps } from 'naive-ui';
import { baseApi } from './baseApi';
import type { Availability, Court, ResponseApi } from '~/models';

export const removeCourt = async (id: number): Promise<void> => {
  await baseApi(`court/${id}`, 'DELETE');
};

export const fetchCourts = async ({
  page,
  pageSize,
  search
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<Court>> => {
  const result = await baseApi('court', 'GET', {
    page: page?.toString(),
    take: pageSize?.toString(),
    search
  });
  return result as ResponseApi<Court>;
};

export const updateCourt = async (data: Court): Promise<Court> => {
  const result = await baseApi(`court/${data.id}`, 'PATCH', data);
  return result as Court;
};
export const createCourt = async (data: Court): Promise<Court> => {
  const result = await baseApi(`court`, 'POST', data);
  return result as Court;
};

export const fetchCourtPublic = async (id: number, date: number): Promise<Availability[]> => {
  const result = await baseApi(`court/public/${id}`, 'GET', {
    bookingDate: `${date}`
  });
  const data = result as any;
  return data.availability as Availability[];
};
