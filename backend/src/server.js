require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// DEBUG LOGGING - Log all requests
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'WearVirtually API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const http = require('http');
const socketService = require('./socket/socketService');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socketService.init(server);

app.listen = (...args) => {
  server.listen(...args);
};

// ... existing code ...

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/saved-items', require('./routes/savedItems'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/try-on', require('./routes/tryOn'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Network: http://192.168.100.44:${port}`);
});
