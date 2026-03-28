require('dotenv').config();
const { checkEnv } = require('./utils/envCheck');
checkEnv();

const express = require('express');
const http = require('http');
const path = require('path');
const helmet = require('helmet');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./config/db');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.set('io', io);

app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));
app.use('/notes', require('./routes/files'));
app.use('/notes/:id/comments', require('./routes/comments'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

initSocket(io);

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'Untitled',
        content TEXT DEFAULT '',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS note_collaborators (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(note_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS note_versions (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        title VARCHAR(255),
        content TEXT,
        saved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS note_files (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100),
        size INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

      CREATE TABLE IF NOT EXISTS pending_invitations (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        inviter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        invitee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(note_id, invitee_id)
      );

      -- Performance indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_note_collaborators_user_id ON note_collaborators(user_id);
      CREATE INDEX IF NOT EXISTS idx_note_collaborators_note_id ON note_collaborators(note_id);
      CREATE INDEX IF NOT EXISTS idx_comments_note_id ON comments(note_id);
      CREATE INDEX IF NOT EXISTS idx_note_files_note_id ON note_files(note_id);
      CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON note_versions(note_id);
      CREATE INDEX IF NOT EXISTS idx_pending_invitations_invitee ON pending_invitations(invitee_id, status);
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
initDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('Database pool closed');
    } catch (err) {
      console.error('Error closing pool:', err);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
