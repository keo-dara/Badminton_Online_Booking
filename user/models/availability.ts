import type { Time } from './time';

export type Availability = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  isBusy: boolean;
  isBooked: boolean;
  isDisable: boolean;
  bookingDate: Date;
  time: Time;
  displayTime: string;
};
