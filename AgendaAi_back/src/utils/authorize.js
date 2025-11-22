export const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!requiredPermissions.includes(userRole)) {
      return res.status(403).json({
        message: 'Sem autorização'
      });
    }
    next();
  }
}