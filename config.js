require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  proxy: {
    host: process.env.PROXY_HOST || '0.0.0.0',
    portStart: parseInt(process.env.PROXY_PORT_START) || 30000,
    portEnd: parseInt(process.env.PROXY_PORT_END) || 35000,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000, // 1 hour
    inactiveTimeout: parseInt(process.env.INACTIVE_TIMEOUT) || 600000 // 10 minutes
  },
  
  database: {
    path: process.env.DB_PATH || './database/bedrock-proxy.db'
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
  },
  
  cleanup: {
    interval: parseInt(process.env.CLEANUP_INTERVAL) || 300000 // 5 minutes
  },
  
  domain: process.env.DOMAIN || 'localhost'
};

module.exports = config;