const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map(e => e.message).join('; ');
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.body = result.data;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const details = result.error.issues.map(e => e.message).join('; ');
      return res.status(400).json({ error: 'Validation failed', details });
    }
    next();
  };
};

module.exports = { validateBody, validateParams };
