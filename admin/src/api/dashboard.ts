import type { Dashboard } from '~/models/dashboard';
import { baseApi } from '.';
export const fetchDashboard = async (): Promise<Dashboard> => {
  const today = new Date();
  const formate_date = today.toISOString().split('T')[0];

  const res = await baseApi('dashboard', 'GET', {
    date: formate_date
  });
  return res as Dashboard;
};

export const uploadImage = async (data: any): Promise<string> => {
  const res = await baseApi('upload', 'POST', data);

  return (res as any).url as string;
};
