import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const toSqlDatetime = (date) => {
  const dateWithOffest = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return dateWithOffest.getTime();
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export const formatCurrencyString = (value: string): string => {
  // Takes string from api like '$2000' and format it to '$2,000'
  // Eventually API should return raw data so this isn't needed
  const formatted = value.toString().replace('$', '');
  return formatCurrency(parseInt(formatted));
};

export const formatDate = (date, formatter = 'MMM do @ hh:mmaa', opts = {}) => {
  if (!date) {
    return '';
  }

  const normalized = date instanceof Date ? date : new Date(date);

  if (!normalized) {
    return 'Unknown date';
  }

  return formatInTimeZone(normalized, 'America/New_York', formatter, opts);
};

const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });

const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th'],
]);

export const formatOrdinals = (num) => {
  const rule = pr.select(num);
  const suffix = suffixes.get(rule);
  return `${num}${suffix}`;
};
