const checkRole = (requiredRole) => (req, res, next) => {
  if (req.user && req.user.role === requiredRole) {
    return next();
  }
  return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
};

module.exports = checkRole;
