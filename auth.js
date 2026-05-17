const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const database = require('../config/database');

class AuthService {
  async register(username, password) {
    // Validate username
    if (!username || username.length < 3 || username.length > 20) {
      throw new Error('Username must be 3-20 characters');
    }
    
    // Validate password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Check if username exists
    const existing = await database.get(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await database.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    return {
      id: result.id,
      username
    };
  }

  async login(username, password) {
    // Find user
    const user = await database.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await database.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.security.jwtSecret,
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.security.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();