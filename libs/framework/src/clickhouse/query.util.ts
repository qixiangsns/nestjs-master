import { format } from 'date-fns';

// Convert date object to clickhouse DateTime field
export const formatDateTime = (date: Date) =>
  format(date, 'yyyy-MM-dd HH:mm:ss');
