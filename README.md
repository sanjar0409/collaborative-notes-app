# Real-time Collaborative Notes App

A mini Google Docs clone where multiple users can collaboratively edit notes in real-time using WebSocket (Socket.IO).

## Features

- **Authentication** - Email/password signup & login, Google OAuth 2.0, GitHub OAuth
- **Notes CRUD** - Create, edit, delete notes with rich text editing
- **Real-time Collaboration** - Multiple users editing the same note simultaneously via Socket.IO
- **Invite Collaborators** - Add users by email with pending invitation system (accept/decline)
- **Online Users & Presence** - See who's currently editing, typing indicators, remote cursor tracking
- **Version History** - Auto-saves last 5 versions, restore any version
- **Comment System** - Real-time comments with resolve/delete functionality
- **File Sharing** - Upload and share files within notes (PDF, images, docs, code — 10MB limit)
- **Rich Text Editor** - TipTap-based editor with bold, italic, underline, headings, lists, text colors, alignment
- **Auto-save** - 500ms debounced auto-save with optimistic UI
- **User Profiles** - Avatar upload with profile display across the app
- **Real-time Notifications** - Comment, file, and collaboration activity notifications
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- React 19, React Router 7, Vite 8
- Tailwind CSS 4
- TipTap (rich text editor)
- Socket.IO Client
- Axios, DOMPurify, Lucide Icons

### Backend
- Node.js, Express 5
- Socket.IO
- PostgreSQL (pg)
- JWT + Bcrypt authentication
- Zod validation
- Multer (file uploads)
- Helmet, CORS, express-rate-limit

## Prerequisites

- Node.js (v18+)
- PostgreSQL database

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd codyfy_task
```

### 2. Setup PostgreSQL

```sql
CREATE DATABASE collab_notes;
```

Tables are auto-created on server start.

### 3. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/collab_notes
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

Start the server:

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the client:

```bash
npm run dev
```

### 5. Open in browser

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## How It Works

1. **Register/Login** - Create an account (email/password, Google, or GitHub) and get a JWT token
2. **Create Notes** - Click "New Note" on the dashboard
3. **Invite Collaborators** - Click "Share" and enter their email; they receive a real-time invitation
4. **Real-time Editing** - All collaborators see changes instantly with cursor tracking
5. **Comments** - Add comments in the sidebar, visible to all collaborators
6. **File Sharing** - Upload and share files within a note
7. **Version History** - Click "History" to see/restore previous versions

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | id, name, email (unique), password, avatar_url, created_at |
| `notes` | id, title, content (HTML), user_id (FK), created_at, updated_at |
| `note_collaborators` | id, note_id (FK), user_id (FK), role, created_at |
| `note_versions` | id, note_id (FK), title, content, saved_by (FK), created_at |
| `comments` | id, note_id (FK), user_id (FK), content, resolved, created_at |
| `note_files` | id, note_id (FK), user_id (FK), filename, original_name, mimetype, size, created_at |
| `pending_invitations` | id, note_id (FK), inviter_id (FK), invitee_id (FK), status, created_at |

## API Endpoints

### Auth
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `POST /auth/google` - Google OAuth login
- `POST /auth/github` - GitHub OAuth login
- `POST /auth/avatar` - Upload avatar
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Notes
- `GET /notes` - Get all notes (owned + shared)
- `GET /notes/:id` - Get single note
- `POST /notes` - Create note
- `PATCH /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note (owner only)

### Collaboration
- `GET /notes/:id/collaborators` - List collaborators
- `POST /notes/:id/collaborators` - Invite user by email
- `DELETE /notes/:id/collaborators/:userId` - Remove collaborator
- `GET /notes/invitations/pending` - Get pending invitations
- `POST /notes/invitations/:invitationId/accept` - Accept invitation
- `POST /notes/invitations/:invitationId/decline` - Decline invitation

### Version History
- `GET /notes/:id/versions` - Get last 5 versions
- `POST /notes/:id/versions/:vid/restore` - Restore version

### Comments
- `GET /notes/:id/comments` - List comments
- `POST /notes/:id/comments` - Add comment
- `PATCH /notes/:id/comments/:cid` - Resolve/unresolve comment
- `DELETE /notes/:id/comments/:cid` - Delete comment

### Files
- `POST /notes/:id/files` - Upload file
- `GET /notes/:id/files` - List files
- `DELETE /notes/:id/files/:fid` - Delete file

## Socket.IO Events

| Direction | Event | Description |
|-----------|-------|-------------|
| Client -> Server | `join-note` | Join a note room |
| Client -> Server | `leave-note` | Leave a note room |
| Client -> Server | `note-update` | Send note changes |
| Client -> Server | `cursor-move` | Send cursor position |
| Client -> Server | `typing` | Start typing indicator |
| Client -> Server | `stop-typing` | Stop typing indicator |
| Client -> Server | `comment-add` | Add comment |
| Client -> Server | `comment-resolve` | Toggle comment resolved |
| Client -> Server | `comment-delete` | Delete comment |
| Server -> Client | `note-updated` | Receive note changes |
| Server -> Client | `note-users` | Users in note room |
| Server -> Client | `user-joined` | User joined note |
| Server -> Client | `user-left` | User left note |
| Server -> Client | `cursor-update` | Others' cursor positions |
| Server -> Client | `user-typing` | User started typing |
| Server -> Client | `user-stop-typing` | User stopped typing |
| Server -> Client | `comment-added` | New comment posted |
| Server -> Client | `comment-resolved` | Comment resolved/unresolved |
| Server -> Client | `comment-deleted` | Comment deleted |
| Server -> Client | `file-uploaded` | File shared to note |
| Server -> Client | `file-deleted` | File removed |
| Server -> Client | `invitation-received` | New collaboration invite |
| Server -> Client | `online-users` | All online users |

## Project Structure

```
codyfy_task/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   └── ui/             # Reusable base components
│   │   ├── context/            # Auth, Socket, Invitation contexts
│   │   ├── hooks/              # Custom hooks (collaboration, data, etc.)
│   │   ├── lib/                # API and socket configuration
│   │   ├── pages/              # Dashboard, Login, Register, NoteEditor
│   │   ├── styles/             # Additional styles
│   │   └── utils/              # Utility functions
│   └── public/                 # Static assets
└── server/                     # Node.js Backend
    ├── src/
    │   ├── config/             # Database and upload config
    │   ├── controllers/        # Route handlers
    │   ├── middleware/          # JWT auth middleware
    │   ├── routes/             # Express routes
    │   ├── socket/             # Socket.IO event handlers
    │   └── utils/              # Validation, cookies, env check
    └── uploads/                # File storage (avatars, files)
```

## Deploy

- **Frontend:** Netlify / Vercel (static build)
- **Backend:** Render.com (Express + Socket.IO)
- **Database:** PostgreSQL (Render, Neon.tech, or Supabase)
