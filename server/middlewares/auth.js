const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY || 'mysecretkey'; 

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
    req.user = decoded; // decoded contains { userId, email, role }
    
    next();
  });
}

// Middleware for workers only
function authorizeWorker(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  if (req.user.role !== 'worker') {
    return res.status(403).json({ status: false, message: "Access denied: Workers only" });
  }
  next();
}

// Middleware for managers only
function authorizeManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  if (req.user.role !== 'manager') {
    return res.status(403).json({ status: false, message: "Access denied: Managers only" });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeWorker,
  authorizeManager,
  JWT_SECRET,
};
