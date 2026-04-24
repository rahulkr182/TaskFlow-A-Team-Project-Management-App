# 🗂️ TaskFlow — Team Project Management App

A modern, full-stack project management application built with the MERN stack. Features real-time Kanban boards, team collaboration, and a premium dark UI.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0-6366f1?style=for-the-badge)

## ✨ Features

### Core
- **JWT Authentication** — Secure login/register with access & refresh tokens
- **Role-Based Access** — Admin and Member roles per project
- **Project Management** — Create, edit, delete projects with team member invitations
- **Task Management** — Full CRUD with title, description, priority, due dates, assignees
- **Kanban Board** — Drag-and-drop task columns (To Do → In Progress → Done)
- **Dashboard** — Summary stats, task distribution, overdue tracking

### Bonus
- **Real-time Updates** — Socket.io powered live board updates
- **In-app Notifications** — Instant alerts for assignments, comments, invites
- **Comments** — Threaded comments on tasks
- **File Attachments** — Upload files to tasks (Cloudinary integration)
- **Activity Log** — Full audit trail per project

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| State | TanStack React Query, Zustand |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.io |
| File Upload | Cloudinary |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# Install all dependencies
npm run install:all

# Configure environment
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secrets

# Run development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### Environment Variables

Create `server/.env` with:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

## 📁 Project Structure

```
taskflow/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Shared UI & layout
│   │   ├── features/      # Feature modules
│   │   │   ├── auth/      # Login, Register
│   │   │   ├── dashboard/ # Stats & overview
│   │   │   ├── kanban/    # Board, columns, cards
│   │   │   ├── notifications/
│   │   │   └── projects/  # Project CRUD
│   │   ├── socket/        # Socket.io client
│   │   └── store/         # Zustand stores
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/        # DB & env config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, RBAC, upload
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── socket/        # Socket.io setup
│   │   └── utils/         # JWT helpers
```

## 📜 License

MIT