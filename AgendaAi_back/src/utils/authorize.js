export const authorize = (requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    console.log('user role', userRole)
    if (!userRole.some(r => requiredPermissions.includes(r))) {
      return res.status(403).json({
        message: 'Sem autorização'
      });
    }
    next();
  }
}