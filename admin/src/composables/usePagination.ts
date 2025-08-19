import type { PaginationProps } from "naive-ui";

export const usePagination = <T>() => {
  const pag = {
    pagination: reactive<PaginationProps>({
      pageSize: 10,
      page: 1,
      pageCount: 10,
      // prefix({ itemCount }) {
      //   return `Total is ${itemCount}.`
      // }
    }),
    isLoading: ref(false),
    data: ref<T[]>([]),
  };

  return pag;
};
