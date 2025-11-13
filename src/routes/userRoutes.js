// src/routes/userRoutes.js
import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'
const router = express.Router();

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);

// Protected routes
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
