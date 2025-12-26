import express from 'express';
import cors from 'cors';
import connectDB, { sequelize } from './config/db.js';
import { config } from './config/env.js';
import { seedDatabase } from './seeders/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import clientRoutes from './routes/clients.js';
import orderRoutes from './routes/orders.js';
import commentRoutes from './routes/comments.js';
import permissionRoutes from './routes/permissions.js';
import userRoutes from './routes/user.js';

// Import models to ensure they are loaded
import './models/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Drop all existing tables and recreate schema
    console.log('Dropping existing tables...');
    await sequelize.drop({ cascade: true });
    console.log('Tables dropped successfully.');

    // Sync database to create fresh tables
    console.log('Creating new tables...');
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Seed database
    console.log('Seeding database...');
    await seedDatabase();
    console.log('Database seeded successfully.');

    // Start server
    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();