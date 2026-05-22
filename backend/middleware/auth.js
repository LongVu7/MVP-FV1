// Assume that the user is already authenticated for this development phase.
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['role'];

    req.user = {
      accountId: 1, 
      roleName: userRole || 'unauthenticated'
    };

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden: You do not have the correct role to perform this action.",
        yourRole: userRole || "None provided",
        allowedRoles: allowedRoles
      });
    }
    next();
  };
};

module.exports = {
  checkRole
};