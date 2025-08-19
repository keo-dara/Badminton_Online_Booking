export type Time = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  from: number;
  to: number;
  price: string;
  shift: 'morning' | 'afternoon';
};
