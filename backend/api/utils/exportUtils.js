const xlsx = require('xlsx');

/**
 * Sanitizes a value to prevent CSV/Spreadsheet injection attacks.
 * If a string starts with =, +, -, or @, we prepend a single quote.
 */
const sanitizeForExcel = (val) => {
  if (typeof val === 'string') {
    if (['=', '+', '-', '@'].includes(val.charAt(0))) {
      return `'${val}`;
    }
  }
  return val;
};

/**
 * Flattens a nested object for Excel export.
 */
const flattenObject = (obj, prefix = '') => {
  if (!obj) return {};
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (obj[k] !== null && typeof obj[k] === 'object' && !(obj[k] instanceof Date)) {
      if (Array.isArray(obj[k])) {
        acc[pre + k] = JSON.stringify(obj[k]);
      } else {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      }
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

/**
 * Generates an Excel buffer from an array of objects.
 * @param {Array<Object>} data 
 * @param {string} worksheetName 
 * @returns {Buffer}
 */
const generateExcelBuffer = (data, worksheetName = 'Data') => {
  // Sanitize data
  const sanitizedData = data.map(row => {
    const newRow = {};
    for (const key in row) {
      newRow[key] = sanitizeForExcel(row[key]);
    }
    return newRow;
  });

  const wb = xlsx.utils.book_new();
  
  // Create worksheet. If no data, provide at least headers if possible
  let ws;
  if (sanitizedData.length > 0) {
    ws = xlsx.utils.json_to_sheet(sanitizedData);
    
    // Simple column width auto-sizing based on headers
    const cols = Object.keys(sanitizedData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = cols;
  } else {
    // If no data, just create an empty sheet
    ws = xlsx.utils.json_to_sheet([]);
  }

  xlsx.utils.book_append_sheet(wb, ws, worksheetName);

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  sanitizeForExcel,
  flattenObject,
  generateExcelBuffer
};
