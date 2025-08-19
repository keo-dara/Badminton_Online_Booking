import type { Auth, User } from "~/models";
import { baseApi } from "./baseApi";

export const fetchMeApi = async (): Promise<User> => {
  const result = await baseApi(`auth/me`, "GET");
  return result as User;
};
export const generateTokenApi = async (id: number): Promise<string> => {
  const result = await baseApi(`auth/generate/${id}`, "GET");
  return (result as Auth).accessToken;
};
