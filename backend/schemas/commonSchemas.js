const { z } = require('zod');

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id must be a positive integer')
}).strict();

module.exports = { idParamSchema };
