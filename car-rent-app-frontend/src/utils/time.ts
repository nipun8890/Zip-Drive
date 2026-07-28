// Converts UTC ISO string → real local business time (IST)
export const toIST = (utcString: string) => {
  const d = new Date(utcString);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
};
