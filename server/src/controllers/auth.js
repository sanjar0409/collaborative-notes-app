const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { setAuthCookie } = require('../utils/authCookie');
const { sendResetEmail } = require('../utils/email');

const BCRYPT_ROUNDS = 12;

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar_url',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    setAuthCookie(res, token);
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists — always return success
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [hashedToken, expires, email]
    );

    const clientUrl = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')[0].trim()
      : 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendResetEmail(email, resetUrl);

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    const result = await pool.query(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const user = result.rows[0];

    if (!user.reset_token || !user.reset_token_expires) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    if (new Date() > new Date(user.reset_token_expires)) {
      await pool.query(
        'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
        [user.id]
      );
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    const isValidToken = await bcrypt.compare(token, user.reset_token);
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
