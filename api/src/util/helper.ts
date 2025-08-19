export const convertDisplay24Hour = (
  from: number,
  to: number,
  shift: string,
): string => {
  function convertTime(h: number) {
    let hour = Number(h);
    let minutes = '';

    if (hour % 1 !== 0) {
      minutes = '30';
    } else {
      minutes = '00';
    }

    if (shift.trim() === 'afternoon' && hour !== 12) {
      hour += 12;
    }
    if (shift.trim() === 'morning' && hour === 12) {
      hour = 12;
    }
    return hour.toString().replace('.5', '').padStart(2, '0') + ':' + minutes;
  }

  const startTime = convertTime(from);
  const endTime = convertTime(to);

  return `${startTime}-${endTime}`;
};
