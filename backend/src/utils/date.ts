/**
 * Formats a Date object into 'YYYY-MM-DD' using local date components,
 * avoiding UTC conversion issues caused by toISOString().
 */
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
