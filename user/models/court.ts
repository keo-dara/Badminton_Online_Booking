import type { Availability } from './availability';
import type { Time } from './time';

export type Court = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  name: string;
  description: string;
  img: string;
  enable: boolean;
  times: Time[];
  discount: number;
};

export type CourtDetail = {
  court: Court;
  availability: Availability[];
};
