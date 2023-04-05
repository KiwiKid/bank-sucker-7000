export function dateFormatter(date_str?:string) {
    if(!date_str) return '';
    const [day, month, year] = date_str.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }