/**
 * Utility for formatting and unformatting BRL currency values.
 */

export const formatCurrency = (value: string | number): string => {
  const strValue = typeof value === 'number' ? value.toString() : value;
  const digits = strValue.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('pt-BR').format(parseInt(digits));
};

export const unformatCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};
