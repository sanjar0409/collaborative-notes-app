const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { signup, login } = require('../controllers/auth');
const { googleLogin } = require('../controllers/google');
const { githubLogin } = require('../controllers/github');
const { uploadAvatar } = require('../controllers/avatar');
const { avatarUpload } = require('../config/upload');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const { validate, signupSchema, loginSchema } = require('../utils/validate');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, googleLogin);
router.post('/github', authLimiter, githubLogin);
router.post('/avatar', auth, avatarUpload.single('avatar'), uploadAvatar);

router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

module.exports = router;
