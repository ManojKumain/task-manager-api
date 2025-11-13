import express from 'express';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ROUTES
app.use('/tasks', authMiddleware, taskRoutes);

// User Routes
app.use('/users', userRoutes);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
