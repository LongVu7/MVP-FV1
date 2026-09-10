const ICT_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns UTC boundaries corresponding to ICT (UTC+7) start of days.
 * PostgreSQL handles timestamptz gracefully when given standard ISO strings.
 * @param {string} fromDateString - YYYY-MM-DD
 * @param {string} toDateString - YYYY-MM-DD (inclusive)
 * @returns {object} { fromInclusiveIct, toExclusiveIct } (ISO 8601 UTC strings)
 */
function getIctDateBoundaries(fromDateString, toDateString) {
  // Append T00:00:00+07:00 to force parsing as ICT start of day
  const fromInclusiveIct = new Date(`${fromDateString}T00:00:00+07:00`).toISOString();
  
  const toDate = new Date(`${toDateString}T00:00:00+07:00`);
  // Add 1 day to get the exclusive bound (start of next day)
  toDate.setDate(toDate.getDate() + 1);
  const toExclusiveIct = toDate.toISOString();

  return {
    fromInclusiveIct,
    toExclusiveIct
  };
}

module.exports = {
  ICT_TIMEZONE,
  getIctDateBoundaries
};
