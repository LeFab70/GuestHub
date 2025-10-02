const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'GuestHub API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes (simplified)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@guesthub.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@guesthub.com',
          firstName: 'Admin',
          lastName: 'User',
          roles: ['ADMIN']
        },
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 86400
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint ready',
    data: req.body
  });
});

// API Documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'GuestHub API Documentation',
    version: '1.0.0',
    description: 'API for Visitor Management System',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        verify: 'GET /api/auth/verify'
      },
      system: {
        health: 'GET /health',
        home: 'GET /'
      }
    },
    examples: {
      login: {
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'admin@guesthub.com',
          password: 'admin123'
        }
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
