export function dateFormatter(date_str) {
    const [day, month, year] = date_str.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }