import { baseApi } from "./baseApi";

export const fetchReportProduct = async ({
  startDate,
  endDate,
}: {
  startDate?: number;
  endDate?: number;
}): Promise<any> => {
  const result = await baseApi("report/product", "GET", {
    startDate,
    endDate,
  });
  return result as any;
};
export const fetchReportSales = async ({
  startDate,
  endDate,
}: {
  startDate?: number;
  endDate?: number;
}): Promise<any> => {
  const result = await baseApi("report/sales", "GET", {
    startDate,
    endDate,
  });
  return result as any;
};
export const fetchReportLow = async (): Promise<any> => {
  const result = await baseApi("report/low", "GET");
  return result as any;
};
export const fetchReportCustomer = async (): Promise<any> => {
  const result = await baseApi("report/customer", "GET");
  return result as any;
};
