// src/controllers/userController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// ------------------
// CREATE (Sign Up)
// ------------------
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Create token on signup
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

// ------------------
// LOGIN
// ------------------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

// ------------------
// READ All Users (admin-level)
// ------------------
export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, tasks: true },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// ------------------
// READ Current User
// ------------------
export const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // ✅ Prevent access to other users
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, tasks: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ------------------
// UPDATE User (self only)
// ------------------
export const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // ✅ Only allow the logged-in user to update themselves
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { name, email, password } = req.body;
    const updateData = { name, email };

    // Optional: handle password change securely
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// ------------------
// DELETE User (self only)
// ------------------
export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
