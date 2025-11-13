import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT payload:", decoded); // 👈 add this line

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

