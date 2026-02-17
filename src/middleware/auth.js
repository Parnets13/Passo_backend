import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Worker from '../models/Worker.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find admin first
      let user = await Admin.findById(decoded.id).select('-password');
      
      if (user) {
        // It's an admin
        req.admin = user;
        req.userType = 'admin';
        
        if (user.status !== 'Active') {
          return res.status(401).json({
            success: false,
            message: 'Admin account is inactive'
          });
        }
      } else {
        // Try to find worker
        user = await Worker.findById(decoded.id).select('-password');
        
        if (user) {
          // It's a worker
          req.user = user;
          req.admin = user; // For backward compatibility
          req.userType = 'worker';
          
          if (user.status !== 'Approved') {
            return res.status(401).json({
              success: false,
              message: `Your account is ${user.status}. Please wait for admin approval.`,
              status: user.status
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.admin?.role || req.user?.workerType;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role ${userRole} is not authorized to access this route`
      });
    }
    next();
  };
};
