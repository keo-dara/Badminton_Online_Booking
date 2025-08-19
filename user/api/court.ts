import type {
  PaginationOption,
  PaginationResult
} from '~/interfaces/pagination.interface';
import type { Court, CourtDetail } from '~/models/court';
import { baseApi } from './baseApi';

export const getCourts = async (options: PaginationOption) => {
  const url = `court/public`;

  const data = await baseApi(url, 'GET', {
    ...options
  });

  return data as PaginationResult<Court>;
};

export const getCourtById = async (
  id: string,
  bookingDate: number
): Promise<CourtDetail> => {
  const url = `court/public/${id}`;

  const result = await baseApi(url, 'GET', { bookingDate });

  return result as CourtDetail;
};
