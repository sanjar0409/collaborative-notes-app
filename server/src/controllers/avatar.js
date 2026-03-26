const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const current = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (current.rows[0]?.avatar_url?.startsWith('/uploads/avatars/')) {
      const oldFilename = path.basename(current.rows[0].avatar_url);
      const oldPath = path.join(__dirname, '..', '..', 'uploads', 'avatars', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { uploadAvatar };
