const { z } = require('zod');

// Parse strings like "1,2,3" into arrays of integers
const strictIntArray = z.string().transform((val, ctx) => {
  if (!val || !val.trim()) return [];
  const parts = val.split(',');
  const nums = parts.map(p => {
    const n = Number(p.trim());
    if (isNaN(n) || !Number.isInteger(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid integer: ${p}` });
      return z.NEVER;
    }
    return n;
  });
  return nums;
});

const getDashboardReportSchema = z.object({
  query: z.object({
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    sourceIds: strictIntArray.optional(),
    sourceDetailIds: strictIntArray.optional(),
    majorIds: strictIntArray.optional(),
    regionIds: strictIntArray.optional(),
  })
});

module.exports = {
  getDashboardReportSchema
};
