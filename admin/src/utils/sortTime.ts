import type { Availability, Time } from '~/models';

export const sortTimes = (times: Time[]) => {
  const morning = (times ?? [])
    .filter(av => av.shift == 'morning')
    .sort((a, b) => a.to! - b.to!);

  const afternoon = (times ?? [])
    .filter(av => av.shift! == 'afternoon' && av.to! <= 6)
    .sort((a, b) => a.to! - b.to!);

  const evening = (times ?? [])
    .filter(av => av.shift! == 'afternoon' && av.to! > 6)
    .sort((a, b) => a.to! - b.to!);

  return [...morning, ...afternoon, ...evening];
};

export const sortAvailabilities = (times: Availability[]) => {
  const morning = (times ?? [])
    .filter(av => av.time.shift == 'morning')
    .sort((a, b) => a.time.to! - b.time.to!);

  const afternoon = (times ?? [])
    .filter(av => av.time.shift! == 'afternoon' && av.time.to! <= 6)
    .sort((a, b) => a.time.to! - b.time.to!);

  const evening = (times ?? [])
    .filter(av => av.time.shift! == 'afternoon' && av.time.to! > 6)
    .sort((a, b) => a.time.to! - b.time.to!);

  return [...morning, ...afternoon, ...evening];
};
