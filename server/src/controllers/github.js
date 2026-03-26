const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { setAuthCookie } = require('../utils/authCookie');

const githubLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'GitHub authorization code is required' });
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(401).json({ error: 'GitHub authentication failed' });
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userResponse.json();

    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailsResponse.json();
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'No verified email found on GitHub account' });
    }

    const name = githubUser.name || githubUser.login;
    const avatar = githubUser.avatar_url;

    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length > 0) {
      user = result.rows[0];
      if (!user.avatar_url && avatar) {
        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar, user.id]);
        user.avatar_url = avatar;
      }
    } else {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      result = await pool.query(
        'INSERT INTO users (name, email, password, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar_url',
        [name, email, randomPassword, avatar || null]
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
    });
  } catch (err) {
    console.error('GitHub login error:', err);
    res.status(401).json({ error: 'GitHub authentication failed' });
  }
};

module.exports = { githubLogin };
