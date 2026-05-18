const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');
  
  // console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');
  // console.log('Auth middleware - Token value:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Auth middleware - Decoded user:', decoded.user.id);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};