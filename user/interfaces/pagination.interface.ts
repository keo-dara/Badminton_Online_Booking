export interface PaginationOption {
  page: number;
  take: number;
}

export interface PaginationResult<T> {
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: T[];
}
