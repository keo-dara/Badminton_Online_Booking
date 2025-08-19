export type ResponseApi<T> = {
  data: T[];
  meta?: {
    take: number;
    itemCount: number;
    pageCount: number;
  };
};

export type HttpResponseError = {
  statusCode: number;
  message: string;
  error: string;
};
