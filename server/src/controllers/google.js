const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { setAuthCookie } = require('../utils/authCookie');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length > 0) {
      user = result.rows[0];
      if (!user.avatar_url && picture) {
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [picture, user.id]);
        user.avatar_url = picture;
      }
    } else {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      result = await pool.query(
        'INSERT INTO users (name, email, password, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar_url',
        [name, email, randomPassword, picture || null]
      );
      user = result.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    setAuthCookie(res, token);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      token,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
};

module.exports = { googleLogin };
