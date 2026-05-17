const express = require('express');
const router = express.Router();
const sessionManager = require('../sessions/sessionManager');
const database = require('../config/database');
const authenticate = require('../middleware/auth');

// Get system stats
router.get('/stats', authenticate, (req, res) => {
  try {
    const stats = sessionManager.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's session history
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await database.all(
      `SELECT id, target_ip, target_port, proxy_port, status, 
              created_at, last_activity, ended_at
       FROM sessions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get overall analytics (last 24 hours)
router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalSessions = await database.get(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
      [userId]
    );
    
    const activeSessions = sessionManager.getUserSessions(userId).length;
    
    const recentSessions = await database.get(
      `SELECT COUNT(*) as count FROM sessions 
       WHERE user_id = ? AND created_at > datetime('now', '-24 hours')`,
      [userId]
    );
    
    res.json({
      success: true,
      analytics: {
        totalSessions: totalSessions.count,
        activeSessions,
        recentSessions: recentSessions.count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;