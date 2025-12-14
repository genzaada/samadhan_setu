const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if user still exists (important for in-memory DB restarts)
            const User = require('../models/User'); // Import User model inside middleware to avoid circular deps if any
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            console.log(`[Auth] User: ${user.email}, Role: ${user.role}, ReqRoles: ${roles}`);

            req.user = decoded;

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
};

module.exports = authMiddleware;
