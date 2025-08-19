import type { ApiOrder, KhQrInfo, Plan, ResponseApi, Subscription, User } from "~/models";
import { baseApi } from ".";
import type { PaginationProps } from "naive-ui";

export const fetchUsers = async ({
  page,
  pageSize,
  search,
}: Partial<
  PaginationProps & {
    search?: string;
  }
>): Promise<ResponseApi<any>> => {
  const result = await baseApi("users", "GET", {
    page: page,
    take: pageSize,
    search,
  });
  return result as ResponseApi<any>;
};
export const fetchUsersSystem = async ({
  page,
  pageSize,
  search,
  order,
}: Partial<
  PaginationProps & {
    search?: string;
    order?: ApiOrder;
  }
>): Promise<ResponseApi<any>> => {
  const result = await baseApi("users/system/root", "GET", {
    page: page,
    take: pageSize,
    search,
    order: order,
  });
  return result as ResponseApi<any>;
};
export const fetchPlan = async (): Promise<Plan[]> => {
  const result = await baseApi("plan", "GET", {
    page: 1,
    take: 10,
  });
  return result as Plan[];
};

export const createSubscribe = async (
  planId: number
): Promise<{
  id: number;
  qr: string;
}> => {
  const result = await baseApi(`subscription`, "POST", {
    planId,
  });
  return result as {
    id: number;
    qr: string;
  };
};
export const fetchSubscribe = async (id: number): Promise<Subscription> => {
  const result = await baseApi(`subscription/${id}`, "GET");
  return result as Subscription;
};

export const fetchMySubscribe = async (): Promise<string> => {
  const result = await baseApi(`subscription/system/me`, "GET");
  return result as string;
};

export const twoFactorSystem = async (enable: boolean): Promise<string> => {
  const result = await baseApi(`auth/2fa`, "POST", {
    enable,
  });
  return result as string;
};

export const addorUpdatePayment = async (id: number, payment: KhQrInfo) => {
  const result = await baseApi(`users/payment/${id}`, "PUT", payment);
  console.log(result);
};

export const addMember = async (user: User): Promise<User> => {
  const data = {
    password: user.password,
    username: user.userName,
    role: user.role,
    shopId: user.shopId,
  };
  const result = await baseApi(`auth/register`, "POST", data);

  return result as User;
};

export const addSystemMember = async (user: User): Promise<User> => {
  const data = {
    password: user.password,
    username: user.userName,
    role: user.role,
    systemName: user.systemName,
    shop: {
      name: user.shop?.name,
      address: user.shop?.address,
      phone: user.shop?.phone,
    },
  };
  const result = await baseApi(`auth/register/system`, "POST", data);

  return result as User;
};

export const resetPasswordMember = async (
  username: string,
  password: string
) => {
  const result = await baseApi(`auth/reset`, "POST", {
    password,
    username,
  });

  return result;
};

export const blockUser = async (id: number) => {
  await baseApi(`users/blocking/${id}`, "POST");
};
